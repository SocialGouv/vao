FROM postgres:17.5-alpine

COPY ./ /pg/

WORKDIR /pg

RUN chmod +x entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
