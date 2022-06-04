// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const response = fetch('http://localhost:5001/chakra-note/us-central1/helloWorld', {
    method: 'POST', 
    headers: {
      "Content-Type": "application/json"
    },
    body: { amount: 2000 }
  })
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

