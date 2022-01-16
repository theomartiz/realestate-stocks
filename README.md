# realestate-stocks

Create a new service:
- In the services directory : `mkdir koa-example` (replace "koa-example" by the name of the service)
- `cd koa-example`
- `npm init -y`
- `npm install koa`
- `npm install @koa/router`


Update a service:
- Make sure you are logged in (replace [account-id] with your own) (you have to see Login Succeeded)
`aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 595534413965.dkr.ecr.us-east-1.amazonaws.com`
- Build the docker image (replace the [service-name] with the service name you want to update)
In the services directory: `docker build -t [service-name] ./[service-name]`
- Tag the docker image 
`docker tag [service-name]:latest 595534413965.dkr.ecr.us-east-1.amazonaws.com/[service-name]:v1`
- Push the docker image to ECR
`docker push 595534413965.dkr.ecr.us-east-1.amazonaws.com/[service-name]:v1`
- Update the service in the ECS cluster
`aws ecs update-service --cluster RealEstateStack-ECSCluster-tDDiPpr0cB66 --service [service-name] --force-new-deployment`