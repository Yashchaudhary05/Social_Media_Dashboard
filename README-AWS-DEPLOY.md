# Deploying to AWS (EC2 + Application Load Balancer)

Step-by-step guide to deploy the Social Media Dashboard on **AWS** using **CloudFormation** with EC2 instances behind an Application Load Balancer and Auto Scaling.

---

## Architecture

```
        Internet
           │
    ┌──────▼──────┐
    │     ALB      │  (Application Load Balancer)
    │   Port 80    │
    └──┬───────┬───┘
       │       │
  ┌────▼──┐ ┌─▼─────┐
  │ EC2-1 │ │ EC2-2  │  (Auto Scaling Group: min 1, max 3)
  │ Nginx │ │ Nginx  │  (Docker containers)
  │:80    │ │:80     │
  └───────┘ └────────┘
       │       │
  ┌────▼───────▼────┐
  │    VPC           │
  │  10.0.0.0/16     │
  │  ┌────┐ ┌────┐  │
  │  │Sub1│ │Sub2│  │  (2 public subnets across AZs)
  │  └────┘ └────┘  │
  └──────────────────┘
```

## What Gets Deployed

| Resource | Details |
|----------|---------|
| **VPC** | 10.0.0.0/16 with Internet Gateway |
| **Subnets** | 2 public subnets across different AZs |
| **ALB** | Internet-facing Application Load Balancer |
| **Target Group** | HTTP health checks on `/` |
| **EC2 Instances** | Amazon Linux 2, Docker + Nginx container |
| **Auto Scaling Group** | Min: 1, Max: 3, Desired: 2 |
| **Scaling Policy** | Target tracking at 70% CPU |
| **Security Groups** | ALB: HTTP 80 inbound; EC2: HTTP from ALB + SSH |

## Prerequisites

1. **AWS CLI** configured with credentials:
   ```bash
   aws configure
   # Access Key, Secret Key, Region (us-east-1), Output (json)
   ```

2. **EC2 Key Pair** created in your target region:
   ```bash
   aws ec2 create-key-pair --key-name dashboard-key --query 'KeyMaterial' --output text > dashboard-key.pem
   chmod 400 dashboard-key.pem
   ```

3. **AWS Account** with permissions for: EC2, VPC, ELB, AutoScaling, CloudFormation

## Deploy

### Option A: One-Command Deploy Script

```bash
export AWS_KEY_PAIR=dashboard-key
export AWS_REGION=us-east-1  # optional, defaults to us-east-1

# Deploy to production
bash deploy/aws/deploy.sh production

# Or deploy to staging
bash deploy/aws/deploy.sh staging
```

The script will:
1. Validate the CloudFormation template
2. Create/update the CloudFormation stack
3. Output the ALB URL when complete

### Option B: Manual CloudFormation Deploy

```bash
aws cloudformation deploy \
  --template-file deploy/aws/cloudformation.yml \
  --stack-name social-dashboard-production \
  --parameter-overrides \
    EnvironmentName=production \
    KeyPairName=dashboard-key \
    InstanceType=t2.micro \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

### Get the Dashboard URL

```bash
aws cloudformation describe-stacks \
  --stack-name social-dashboard-production \
  --query "Stacks[0].Outputs[?OutputKey=='ALBURL'].OutputValue" \
  --output text
```

## Verify Deployment

1. **Check stack status:**
   ```bash
   aws cloudformation describe-stacks --stack-name social-dashboard-production \
     --query "Stacks[0].StackStatus" --output text
   # Expected: CREATE_COMPLETE or UPDATE_COMPLETE
   ```

2. **Check instances are healthy:**
   ```bash
   aws elbv2 describe-target-health \
     --target-group-arn $(aws cloudformation describe-stack-resources \
       --stack-name social-dashboard-production \
       --query "StackResources[?LogicalResourceId=='ALBTargetGroup'].PhysicalResourceId" \
       --output text)
   ```

3. **Open the ALB URL** in your browser — dashboard should load within 2-3 minutes of stack creation.

## SSH into an Instance (Debug)

```bash
# Get instance public IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=production-dashboard-instance" \
  --query "Reservations[*].Instances[*].PublicIpAddress" \
  --output text

# SSH in
ssh -i dashboard-key.pem ec2-user@<INSTANCE_IP>

# Check Docker container
docker ps
docker logs dashboard
```

## Update Deployment

After code changes, instances pull the latest from GitHub on launch. To force an update:

```bash
# Terminate existing instances — ASG replaces them with fresh ones
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name production-dashboard-asg \
  --desired-capacity 0

# Wait, then scale back up
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name production-dashboard-asg \
  --desired-capacity 2
```

## Tear Down

```bash
aws cloudformation delete-stack --stack-name social-dashboard-production
```

This removes **all** resources (VPC, subnets, instances, ALB, etc).

## Cost Estimate

| Resource | Monthly Cost (us-east-1) |
|----------|-------------------------|
| 2x t2.micro EC2 | Free tier (1st year) or ~$18 |
| ALB | ~$16 + $0.008/LCU-hour |
| Data Transfer | Minimal for static site |
| **Total** | **~$0 (free tier)** or **~$35/mo** |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Stack stuck in `CREATE_IN_PROGRESS` | Wait up to 10 min; check Events tab in CloudFormation console |
| Instances unhealthy in target group | SSH in and check `docker ps`; ensure port 80 is serving |
| 502 Bad Gateway from ALB | Instances still bootstrapping; wait 2-3 minutes |
| AMI not found | Update `ImageId` in cloudformation.yml for your region |
| Stack rollback | Check CloudFormation Events for the specific error |

## Security Notes

- The CloudFormation template opens SSH (port 22) to `0.0.0.0/0` for convenience. **Restrict this to your IP in production.**
- Nginx is configured with security headers (CSP, X-Frame-Options, X-XSS-Protection).
- Docker container runs Nginx as non-root process.
- Consider adding HTTPS via ACM + ALB HTTPS listener for production use.
