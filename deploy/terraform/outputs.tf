output "alb_url" {
  description = "Dashboard URL via ALB"
  value       = "http://${aws_lb.main.dns_name}"
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "asg_name" {
  description = "Auto Scaling Group name"
  value       = aws_autoscaling_group.main.name
}
