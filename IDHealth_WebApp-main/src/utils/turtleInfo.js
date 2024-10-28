const getPatientTurtle = (patient) => `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX fhir: <http://hl7.org/fhir/>
PREFIX shex: <http://www.w3.org/ns/shex#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX fhirshex: <http://hl7.org/fhir/shape/>
PREFIX fhirvs: <http://hl7.org/fhir/ValueSet/>

<http://hl7.org/fhir/Patient/${patient.webId}> a fhir:Patient;
fhir:nodeRole fhir:treeRoot;
fhir:Resource.id [
    fhir:v "${patient.webId}"
];
fhir:Patient.name [
    fhir:HumanName.use [
    fhir:v "official"
    ];
    fhir:HumanName.family [
    fhir:v "${patient.nameSurname}";
    fhir:index 0
    ];
    fhir:HumanName.given [
    fhir:v "${patient.name}";
    fhir:index 0
    ], [
    fhir:v "${patient.surname}";
    fhir:index 1
    ];
    fhir:HumanName.prefix [
    fhir:v "${patient.prefixName}";
    fhir:index 0
    ];
    fhir:index 0
];
fhir:Patient.telecom [
    fhir:ContactPoint.system [
    fhir:v "phone"
    ];
    fhir:ContactPoint.value [
    fhir:v "${patient.phoneNumber}"
    ];
    fhir:ContactPoint.use [
    fhir:v "home"
    ];
    fhir:index 0
], [
    fhir:ContactPoint.system [
    fhir:v "email"
    ];
    fhir:ContactPoint.value [
    fhir:v "${patient.email}"
    ];
    fhir:index 1
];
fhir:Patient.gender [
    fhir:v "${patient.gender}"
];
fhir:Patient.birthDate [
    fhir:v "${patient.birthDate}"^^xsd:date
];
fhir:Patient.address [
    fhir:Address.use [
    fhir:v "home"
    ];
    fhir:Address.line [
    fhir:v "${patient.address}"
    ];
    fhir:Address.city [
    fhir:v "${patient.city}"
    ];
    fhir:Address.state [
    fhir:v "${patient.state}"
    ];
    fhir:Address.postalCode [
    fhir:v "${patient.postalCode}"
    ];
    fhir:index 0
].

# Triples not in FHIR Resource:
<http://hl7.org/fhir/Patient/WebIDPOD.ttl> a owl:Ontology;
owl:imports fhir:fhir.ttl;
owl:versionIRI <http://hl7.org/fhir/Patient/WebIDPOD.ttl>.
`;

const getMeasuramentTurtle = (measurament) => (`
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX fhir: <http://hl7.org/fhir/>
PREFIX shex: <http://www.w3.org/ns/shex#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX fhirshex: <http://hl7.org/fhir/shape/>
PREFIX fhirvs: <http://hl7.org/fhir/ValueSet/>

<http://hl7.org/fhir/Observation/${measurament.id}> a fhir:Observation;
  fhir:nodeRole fhir:treeRoot;
  fhir:Resource.id [
    fhir:v "${measurament.id}"
  ];
  fhir:Observation.status [
    fhir:v "final"
  ];
  fhir:Observation.code [
    fhir:CodeableConcept.coding [
      a <http://loinc.org/rdf#15074-8>;
      fhir:Coding.system [
        fhir:v "http://loinc.org"^^xsd:anyURI
      ];
      fhir:Coding.code [
        fhir:v "15074-8"
      ];
      fhir:Coding.display [
        fhir:v "Glucose [Moles/volume] in Blood"
      ];
      fhir:index 0
    ]
  ];
  fhir:Observation.subject [
    fhir:link <${measurament.patientId}>;
    fhir:Reference.reference [
      fhir:v "${measurament.patientId}"
    ]
  ];
  fhir:Observation.effectiveDateTime [
    fhir:v "${measurament.effectiveDateTime}"^^xsd:dateTime
  ];
  fhir:Observation.valueQuantity [
    fhir:Quantity.value [
      fhir:v "${measurament.quantity}"^^xsd:decimal
    ];
    fhir:Quantity.unit [
      fhir:v "mg/dL"
    ];
    fhir:Quantity.system [
      fhir:v "http://unitsofmeasure.org"^^xsd:anyURI
    ];
    fhir:Quantity.code [
      fhir:v "mg/dL"
    ]
  ].
`
)

export {
    getPatientTurtle,
    getMeasuramentTurtle
}