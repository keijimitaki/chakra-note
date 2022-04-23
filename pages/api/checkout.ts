// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import { getApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const functions = getFunctions(getApp());
connectFunctionsEmulator(functions, "localhost", 5001);

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const response = await fetch(`http://localhost:5001/chakra-note/us-central1/createCheckoutSession`, {
    method: 'POST', 
    headers: {
       "Content-Type": "application/json"
    },
    body: JSON.stringify( {
        "line_items": [
          {
            "quantity": 1,
            "price_data": {
              "currency": "usd",
              "unit_amount": 2800,
              "product_data": {
                "name": "サブスク"
              }
            }
          }
        ],
        "customer_email": "kemujidesign@gmail.com" 
      })
    }
  )
   
  const data = await response.json();
  console.log('data=>',data);
  res.status(200).json(data);

}

