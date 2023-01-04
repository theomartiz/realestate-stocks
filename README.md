# Realestate Stocks (a school project)

A microservices application to manage realestate stocks transactions. Built using koa framework. Use asynchronous and synchronous communications. Built on AWS (ECS, SQS).

The `infrastructure/ecs.yml` file contains a ready to load AWS Cloudformation template. It simply creates a VPC containing two public subnets and an internet gateway for the network layer, then an EC2 ECS cluster with auto scaling and LoadBalncer attachment.

Create a new service:
- In the services directory : `mkdir koa-example` (replace "koa-example" by the name of the service)
- `cd koa-example`
- `npm init -y`
- `npm install koa`
- `npm install @koa/router`
