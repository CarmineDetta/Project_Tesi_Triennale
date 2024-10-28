import { overwriteFile } from "@inrupt/solid-client";
import SparqlQueryExecutor from "./sparqlQueryExecutor";
import dayjs from 'dayjs';

const profileQl = (storageUrl) => (`
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX vcard: <http://www.w3.org/2006/vcard/ns#>

SELECT ?name ?email
WHERE {
  <${storageUrl}profile> a foaf:Document;
    foaf:maker ?maker;
    foaf:primaryTopic ?maker.

  ?maker a <http://schema.org/Person>;
    foaf:name ?name;
    vcard:hasEmail ?emailNode.

  ?emailNode a vcard:Home;
    vcard:value ?email.
}
`)

const patientQl = (webId) => (`
PREFIX fhir: <http://hl7.org/fhir/>

SELECT ?familyName ?name ?surname ?prefix ?email ?address ?city ?state ?postalCode ?birthDate ?gender ?phone
WHERE {
  <http://hl7.org/fhir/Patient/${webId}> fhir:Patient.name ?nameResource .
  ?nameResource fhir:HumanName.family/fhir:v ?familyName .
  
  ?nameResource fhir:HumanName.given [
    fhir:v ?name ;
    fhir:index 0
  ].
  
  ?nameResource fhir:HumanName.given [
    fhir:v ?surname ;
    fhir:index 1
  ].
  
  ?nameResource fhir:HumanName.prefix/fhir:v ?prefix .

<http://hl7.org/fhir/Patient/${webId}> fhir:Patient.telecom [
      fhir:ContactPoint.system/fhir:v "phone" ;
      fhir:ContactPoint.value/fhir:v ?phone
    ].

  <http://hl7.org/fhir/Patient/${webId}> fhir:Patient.address ?addressResource .
  ?addressResource fhir:Address.line/fhir:v ?address .
  ?addressResource fhir:Address.city/fhir:v ?city .
  ?addressResource fhir:Address.state/fhir:v ?state .
  ?addressResource fhir:Address.postalCode/fhir:v ?postalCode .

  <http://hl7.org/fhir/Patient/${webId}> fhir:Patient.birthDate/fhir:v ?birthDate .

  <http://hl7.org/fhir/Patient/${webId}> fhir:Patient.gender/fhir:v ?gender .

  <http://hl7.org/fhir/Patient/${webId}> fhir:Patient.telecom ?telecom .
  ?telecom fhir:ContactPoint.system/fhir:v "email" .
  ?telecom fhir:ContactPoint.value/fhir:v ?email .
}
LIMIT 1
`)

const measuramentQl = (id) => (`
PREFIX fhir: <http://hl7.org/fhir/>

SELECT ?value ?dateTime
WHERE {
  <http://hl7.org/fhir/Observation/${id}> fhir:Observation.valueQuantity ?valueQuantity.
  ?valueQuantity fhir:Quantity.value ?valueNode.
  ?valueNode fhir:v ?value.
  
  <http://hl7.org/fhir/Observation/${id}> fhir:Observation.effectiveDateTime ?dateTimeNode.
  ?dateTimeNode fhir:v ?dateTime.
}
`)

const saveFile = async (url, turtle, fetch) => {
  // Overwrite the existing Turtle file with the new Turtle data
  const turtleBlob = new Blob([turtle], { type: 'text/turtle' });
  const response = await overwriteFile(url, turtleBlob, { fetch: fetch });
  return response;
}

async function getPatientInfo(podUrl, webId, sessionFetch) {
    const sparqlExecutor = new SparqlQueryExecutor();
    const patient = await sparqlExecutor.executeQuery(`${podUrl}/patient/Patient.ttl`, patientQl(webId), sessionFetch);

    return {
      "gender": patient.gender,
      "city": patient.city,
      "name": patient.name,
      "birthDate": dayjs(patient.birthDate),
      "phoneNumber": patient.phone,
      "familyName": patient.familyName,
      "state": patient.state,
      "prefix": patient.prefix,
      "address": patient.address,
      "postalCode": patient.postalCode,
      "surname": patient.surname,
      "email": patient.email
  };
}

export {
    profileQl,
    patientQl,
    measuramentQl,
    getPatientInfo,
    saveFile
}