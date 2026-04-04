output "instance_ids" {
  description = "Name of the Auto Scaling Group"
  value       = aws_autoscaling_group.app.name
}

output "instance_public_ips" {
  description = "DNS name of the load balancer (or empty string if ALB disabled)"
  value       = var.enable_alb ? aws_lb.app[0].dns_name : ""
}

output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = var.enable_alb ? aws_lb.app[0].dns_name : ""
}

output "load_balancer_arn" {
  description = "ARN of the load balancer"
  value       = var.enable_alb ? aws_lb.app[0].arn : ""
}

output "autoscaling_group_name" {
  description = "Name of the Auto Scaling Group"
  value       = aws_autoscaling_group.app.name
}
