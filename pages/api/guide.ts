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

//  const response = fetch('http://localhost:5001/chakra-note/us-central1/addMessage?text=aa', {
  const response = fetch(`http://localhost:5001/chakra-note/us-central1/httpEvent?text=aa`, {
    method: 'POST', 
    headers: {
       "Content-Type": "application/json"
    },
    body: JSON.stringify({text: "ddやったぁ"})
  }
  )
  //const response = fetch('http://localhost:5001/chakra-note/us-central1/helloWorld', {method: 'GET'})
  //const response = fetch('http://localhost:5001/chakra-note/us-central1/charges/001', {method: 'GET'})
      .then(res => {
        console.log('res=>',res);
        res.json()
      }).then(data => {
        console.log(data);
      }).catch(error => {
        console.error('通信に失敗しました', error);
      })

  res.status(200).json({ name: 'John Doe' })
}

