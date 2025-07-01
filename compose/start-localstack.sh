#!/bin/bash
export AWS_REGION=eu-west-2
export AWS_DEFAULT_REGION=eu-west-2
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

# S3 buckets
echo "Creating S3 bucket: fcp-mpdp-frontend-perf-tests"
aws --endpoint-url=http://localhost:4566 s3 mb s3://fcp-mpdp-frontend-perf-tests
echo "S3 bucket fcp-mpdp-frontend-perf-tests successfully created"

# SQS queues
# aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name my-queue
