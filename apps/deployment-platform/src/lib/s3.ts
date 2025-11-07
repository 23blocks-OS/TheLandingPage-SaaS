import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront'

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const cloudFrontClient = new CloudFrontClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadFileToS3(
  bucket: string,
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  })

  await s3Client.send(command)
}

export async function deleteFileFromS3(bucket: string, key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  await s3Client.send(command)
}

export async function listS3Objects(bucket: string, prefix: string) {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
  })

  const response = await s3Client.send(command)
  return response.Contents || []
}

export async function invalidateCloudFrontCache(paths: string[]): Promise<void> {
  if (!process.env.CLOUDFRONT_DISTRIBUTION_ID) {
    console.warn('CloudFront distribution ID not set, skipping cache invalidation')
    return
  }

  const command = new CreateInvalidationCommand({
    DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: {
        Quantity: paths.length,
        Items: paths,
      },
    },
  })

  await cloudFrontClient.send(command)
}

export function getDeploymentUrl(subdomain: string): string {
  const domainName = process.env.DOMAIN_NAME
  const useSubdomains = process.env.USE_SUBDOMAINS === 'true'

  if (domainName && useSubdomains) {
    return `https://${subdomain}.${domainName}`
  } else if (process.env.CLOUDFRONT_DOMAIN) {
    return `https://${process.env.CLOUDFRONT_DOMAIN}/${subdomain}`
  }

  return `https://${subdomain}.your-domain.com` // Fallback
}

export const s3 = s3Client
export const cloudfront = cloudFrontClient
