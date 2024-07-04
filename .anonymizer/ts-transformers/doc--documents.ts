import { main } from "./common/lib"


function anonymize(values: Record<string, any>) {

  process.stderr.write(`Anonymizing doc ${values.filename}\n`)
}

main(anonymize)
