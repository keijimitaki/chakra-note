import { NextApiRequest, NextApiResponse } from "next";
import httpProxyMiddleware from "next-http-proxy-middleware";

export default (req: NextApiRequest, res: NextApiResponse) =>
    httpProxyMiddleware(req, res, {
        target: `http://localhost:4000`,
        pathRewrite: [
        //    {
        //     patternStr: "^/functions",
        //     replaceStr: "",
        //     },
            {
            patternStr: "^/api/functions",
            replaceStr: "",
            },
        ],
    }
);
