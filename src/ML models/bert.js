import { Client } from "@gradio/client";
async function getCategory(text) {
  const client = await Client.connect("mikasa07scope/new_model_bert_api");
  const result = await client.predict("/predict", {
    text: text,
  });

  console.log(result.data[0]);
  return result.data[0];
}

export default getCategory;
