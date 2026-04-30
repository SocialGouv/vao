FROM postgres:17.5-alpine

COPY ./ /pg/

WORKDIR /pg

RUN chmod +x entrypoint.sh
RUN chown -R postgres:postgres /pg

USER postgres

ENTRYPOINT ["./entrypoint.sh"]
