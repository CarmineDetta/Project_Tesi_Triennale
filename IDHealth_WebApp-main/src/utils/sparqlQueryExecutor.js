import { QueryEngine } from "@comunica/query-sparql-solid";

class SparqlQueryExecutor {
    constructor() {
      this.engine = new QueryEngine();
    }
  
    async executeQuery(url, queryString, fetch) {
      const { engine } = this;
  
      try {
        const bindingsStream = await engine.queryBindings(queryString, {
            sources: [`${url}`],
            fetch: fetch,
        });
  
        const bindings = await bindingsStream.toArray();

        const result = {};
        bindings.map(binding => {
          binding.forEach((term, variable) => {
            result[variable.value] = term.value
          });
        });
  
        return result;
      } catch (error) {
        console.error('Errore durante l\'esecuzione della query SPARQL:', error);
        throw error;
      }
    }
}

export default SparqlQueryExecutor;