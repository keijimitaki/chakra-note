// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import { getApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const functions = getFunctions(getApp());
connectFunctionsEmulator(functions, "localhost", 5001);

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const response = fetch(`http://localhost:5001/chakra-note/us-central1/createCheckoutSession`, {
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
    } )
  }
  )
  //const response = fetch('http://localhost:5001/chakra-note/us-central1/helloWorld', {method: 'GET'})
  //const response = fetch('http://localhost:5001/chakra-note/us-central1/charges/001', {method: 'GET'})
      .then(res => {
        console.log('res=>',res.json());
        
      }).then(data => {
        console.log(data);
      }).catch(error => {
        console.error('通信に失敗しました', error);
      })

      console.log(response);
  res.status(200).json({ name: 'John Doe' })
}

