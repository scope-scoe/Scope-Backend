import { Client } from "@gradio/client";
async function getKeywords(text) {
  
  const client = await Client.connect("mikasa07scope/keybert_hf");
  const result = await client.predict("/predict", { 		
      text: text, 		
      top_n: 5, 
  });
  console.log(result.data[0]);
  return result.data[0];
}

export default getKeywords;
// Example usage





