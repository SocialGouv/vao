docker stop cron-test
docker rm cron-test
docker rmi cron-test
docker build --pull --no-cache -t cron-test -f packages/cron/Dockerfile .
docker run -d --env-file .env --name cron-test cron-test
docker exec -it cron-test bash