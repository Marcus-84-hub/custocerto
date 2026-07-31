import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyExpress from "@fastify/express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: fs.existsSync(path.join(process.cwd(), ".env.local")) ? ".env.local" : ".env" });

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ SUPABASE_URL or SUPABASE_ANON_KEY is missing from environment variables.");
}

const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

async function startServer() {
  const app = Fastify({
    logger: true,
    bodyLimit: 10 * 1024 * 1024, // 10MB limit for image uploads
  });

  // Register Express integration first so we can mount Vite middlewares
  await app.register(fastifyExpress);
  
  // Register CORS
  await app.register(cors, { origin: "*" });

  // Rota de Saúde
  app.get("/health", async () => ({ status: "online", timestamp: new Date().toISOString() }));
  app.get("/api/health", async () => ({ status: "ok", app: "CustoCerto API (Fastify)" }));

  // Rota de Produtos (EAN)
  app.get("/api/v1/products/:ean", async (request, reply) => {
    const { ean } = request.params as { ean: string };
    
    // Buscar no Supabase
    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("ean", ean)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 is code for "JSON object requested, multiple or no rows returned" (i.e. not found)
      return reply.code(500).send({ success: false, error: "Erro ao buscar produto no banco de dados", details: error.message });
    }

    let shouldUpdateOrInsert = !product;
    let existingProduct = product;

    // Se o produto já existe no banco, mas tem o nome/marca genéricos, tentamos enriquecer
    if (product && (product.name.startsWith("Produto EAN") || product.brand === "Desconhecida")) {
      shouldUpdateOrInsert = true;
    }

    if (shouldUpdateOrInsert) {
      let name = existingProduct ? existingProduct.name : `Produto EAN ${ean}`;
      let brand = existingProduct ? existingProduct.brand : "Desconhecida";
      let unit_weight_grams = existingProduct ? existingProduct.unit_weight_grams : 1000;
      let unit_type = existingProduct ? existingProduct.unit_type : "g";
      let enriched = false;

      try {
        const offResponse = await fetch(`https://world.openfoodfacts.org/api/v2/product/${ean}.json`, {
          headers: {
            "User-Agent": "CustoCertoApp - Web - Version 1.0"
          }
        });
        if (offResponse.ok) {
          const offData = await offResponse.json();
          if (offData.status === 1 && offData.product) {
            const p = offData.product;
            name = p.product_name_pt || p.product_name || name;
            brand = p.brands || p.brand_owner || brand;
            enriched = true;
            
            if (p.net_weight_value) {
              unit_weight_grams = Number(p.net_weight_value);
              unit_type = p.net_weight_unit || 'g';
            } else if (p.quantity) {
              const match = p.quantity.match(/(\d+[,.]?\d*)\s*(g|kg|ml|l|un|sachês|sachê)/i);
              if (match) {
                let val = parseFloat(match[1].replace(',', '.'));
                let unit = match[2].toLowerCase();
                if (unit === 'kg') {
                  val = val * 1000;
                  unit = 'g';
                } else if (unit === 'l') {
                  val = val * 1000;
                  unit = 'ml';
                } else if (unit === 'sachês' || unit === 'sachê') {
                  unit = 'un';
                }
                unit_weight_grams = val;
                unit_type = unit;
              }
            }
          }
        }
      } catch (err) {
        console.warn("Erro ao buscar produto na Open Food Facts:", err);
      }

      if (!existingProduct) {
        // Insere novo produto
        const newProduct = {
          ean,
          name,
          brand,
          unit_weight_grams,
          unit_type
        };

        const { data: insertedProduct, error: insertError } = await supabase
          .from("products")
          .insert([newProduct])
          .select()
          .single();

        if (insertError) {
          return reply.code(500).send({ success: false, error: "Erro ao cadastrar produto padrão", details: insertError.message });
        }

        return reply.send({
          success: true,
          data: insertedProduct
        });
      } else if (enriched) {
        // Atualiza produto existente com os dados enriquecidos
        const { data: updatedProduct, error: updateError } = await supabase
          .from("products")
          .update({
            name,
            brand,
            unit_weight_grams,
            unit_type
          })
          .eq("ean", ean)
          .select()
          .single();

        if (!updateError && updatedProduct) {
          return reply.send({
            success: true,
            data: updatedProduct
          });
        }
      }
    }

    return reply.send({
      success: true,
      data: product
    });
  });

  // Rota de Preços / Gôndola (Crowdsourcing)
  app.post("/api/v1/prices", async (request, reply) => {
    const { ean, price, supermarket_name, latitude, longitude } = request.body as {
      ean: string;
      price: number;
      supermarket_name: string;
      latitude?: number;
      longitude?: number;
    };

    // Primeiro garantimos que o produto exista no banco de dados para evitar erro de chave estrangeira (FK)
    const { data: product, error: checkError } = await supabase
      .from("products")
      .select("ean")
      .eq("ean", ean)
      .single();

    if (checkError || !product) {
      // Se não existir, insere um produto temporário padrão
      const { error: insertError } = await supabase
        .from("products")
        .insert([{
          ean,
          name: `Produto EAN ${ean}`,
          brand: "Desconhecida",
          unit_weight_grams: 1000,
          unit_type: "g"
        }]);

      if (insertError) {
        return reply.code(500).send({ success: false, error: "Erro ao registrar produto padrão para o preço", details: insertError.message });
      }
    }

    // Insere o preço na tabela prices
    const { data, error } = await supabase
      .from("prices")
      .insert([{
        ean,
        price,
        supermarket_name,
        latitude,
        longitude
      }])
      .select()
      .single();

    if (error) {
      return reply.code(500).send({ success: false, error: "Erro ao registrar preço no banco de dados", details: error.message });
    }

    return reply.code(201).send({ success: true, message: "Preço registrado com sucesso!", data });
  });

  // AI Price Tag / Label Reader API endpoint
  app.post("/api/scan-price-tag", async (request, reply) => {
    try {
      const { imageBase64 } = request.body as { imageBase64: string };
      if (!imageBase64) {
        return reply.code(400).send({ error: "Imagem não fornecida" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return structured mock fallback if API key is not yet set
        return reply.send({
          name: "Detergente Ypê",
          brand: "Ypê",
          price: 2.15,
          quantity: 500,
          unit: "mL",
          category: "Limpeza",
          unitPriceFormatted: "R$ 4,30 / L",
          confidence: "demo"
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `Analise a foto desta etiqueta de preço ou embalagem de supermercado brasileiro.
Extraia e responda estritamente em formato JSON com a seguinte estrutura:
{
  "name": "Nome do produto (ex: Sabão em Pó Omo, Detergente Ypê, Café Orfeu)",
  "brand": "Marca (se identificada)",
  "price": 0.00 (Preço numérico em Reais),
  "quantity": 0 (Quantidade numérica da embalagem, ex: 500, 1, 2),
  "unit": "unidade de medida (kg, g, L, mL, un, rolos)",
  "category": "Alimentos" | "Limpeza" | "Higiene" | "Bebidas" | "Hortifruti" | "Outros"
}
Se não tiver certeza absoluta de algum dado, faça uma estimativa razoável baseada na imagem. Responda APENAS o JSON válido.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: cleanBase64
                }
              }
            ]
          }
        ]
      });

      const text = response.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return reply.send(parsed);
      } else {
        return reply.send({
          name: "Item Identificado",
          price: 5.50,
          quantity: 1,
          unit: "un",
          category: "Outros"
        });
      }
    } catch (err: any) {
      app.log.error(err, "Erro na leitura de etiqueta Gemini");
      return reply.code(500).send({ error: "Falha ao processar etiqueta de preço", details: err.message });
    }
  });

  // AI Smart Inflation & Economy Tips API
  app.post("/api/smart-tip", async (request, reply) => {
    try {
      const { items, totalSpent, budgetLimit } = request.body as { items: any[]; totalSpent: number; budgetLimit: number };
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return reply.send({
          tip: "Dica: Fique atento aos produtos de marca própria do supermercado em itens de limpeza e arroz/feijão — costumam ser 15% a 25% mais baratos com a mesma qualidade!",
          savingsPotential: "Aproximadamente R$ 12,50"
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Atue como Consultor de Economia Doméstica no Brasil.
Itens no carrinho atual: ${JSON.stringify(items || [])}
Total gasto até agora: R$ ${totalSpent || 0}
Limite de orçamento: R$ ${budgetLimit || 0}

Forneça UMA dica curta, prática e direta (no máximo 3 frases) em português do Brasil sobre como economizar nesta compra, trocar marcas de embalagem ou substituir itens para não estourar o orçamento.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      return reply.send({ tip: response.text || "Substitua embalagens pequenas por embalagens econômicas." });
    } catch (err: any) {
      return reply.code(500).send({ error: "Erro ao gerar dica" });
    }
  });

  // Vite middleware in dev mode / Static in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Wrap Vite middleware to avoid intercepting API/health routes
    app.use((req, res, next) => {
      const url = req.url || "";
      if (url.startsWith("/api") || url.startsWith("/health")) {
        return next();
      }
      vite.middlewares(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", async (request, reply) => {
      const html = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
      return reply.type("text/html").send(html);
    });
  }

  const PORT = Number(process.env.PORT) || 3333;
  try {
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`🚀 CustoCerto Backend rodando na porta ${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();
