FROM alpine:3.20

RUN apk add --no-cache curl
RUN curl -O https://dl.min.io/client/mc/release/linux-amd64/mc \
    && chmod +x mc && mv mc /usr/bin/mc

WORKDIR /app 
COPY --chmod=755 entrypoint.sh entrypoint.sh
ENTRYPOINT [ "./entrypoint.sh" ]


