#!/bin/bash
# ──────────────────────────────────────────────────────
# deploy.sh — Deploy Social Media Dashboard to AWS
# Usage: ./deploy.sh [staging|production]
# ──────────────────────────────────────────────────────
set -euo pipefail

ENV="${1:-production}"
STACK_NAME="social-dashboard-${ENV}"
REGION="${AWS_REGION:-us-east-1}"
KEY_PAIR="${AWS_KEY_PAIR:?Set AWS_KEY_PAIR env variable}"

echo "╔══════════════════════════════════════════════╗"
echo "║  Deploying Social Media Dashboard            ║"
echo "║  Environment: ${ENV}                          "
echo "║  Region:      ${REGION}                       "
echo "║  Stack:       ${STACK_NAME}                   "
echo "╚══════════════════════════════════════════════╝"

# Validate template
echo "→ Validating CloudFormation template..."
aws cloudformation validate-template \
  --template-body file://deploy/aws/cloudformation.yml \
  --region "${REGION}"

# Deploy stack
echo "→ Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file deploy/aws/cloudformation.yml \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --parameter-overrides \
    EnvironmentName="${ENV}" \
    KeyPairName="${KEY_PAIR}" \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset

# Get output URL
echo ""
echo "→ Fetching dashboard URL..."
URL=$(aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --region "${REGION}" \
  --query "Stacks[0].Outputs[?OutputKey=='ALBURL'].OutputValue" \
  --output text)

echo ""
echo "✅ Deployment complete!"
echo "🌐 Dashboard URL: ${URL}"
echo ""
echo "Note: It may take 2-3 minutes for instances to pass health checks."
