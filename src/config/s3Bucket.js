import { S3Client } from "@aws-sdk/client-s3"
import dotenv from "dotenv";
dotenv.config()
// const { fromNodeProviderChain } = require("@aws-sdk/credential-provider-node");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // credentials: fromNodeProviderChain(),
});

const S3_BUCKET = process.env.AWS_S3_BUCKET || "storage-staging";

export {
  s3Client,
  S3_BUCKET,
}