## Description

An api to add create accommodations in VAO

## Project setup

```bash
pnpm -w install
```

## Compile and run the project

```bash
# development
$ pnpm --filter @vao/external-api start

# watch mode
$ pnpm --filter @vao/external-api start:dev

# production mode
$ pnpm --filter @vao/external-api start:prod
```

## Run tests

```bash
# unit tests
$ pnpm --filter @vao/external-api test

# test coverage
$ pnpm --filter @vao/external-api test:cov
```

## Swagger

swagger is available on [https://api.vao.social.gouv.fr/api](https://api.vao.social.gouv.fr/api)

## Authentication

This API uses JWT Bearer Tokens for authentication. Include the token in the Authorization header of your requests:

```makefile
Authorization: Bearer <your-token>
```

To get a token go to [https://vao.social.gouv.fr/mon-compte](https://vao.social.gouv.fr/mon-compte) click on `générer une nouvelle clé d'api`

**Important:**

- After **5 consecutive failed authentication attempts** with invalid tokens, the IP address will be **banned for 1 hour**. \* Ensure your tokens are valid and properly formatted to avoid being banned.

## Endpoints

### 1\. **Accommodation**

#### **POST /accommodation**

Create a new accommodation.

**Headers:** \* `Authorization`: Bearer Token (required)

**Request Body:** The request must include the following JSON object:

```json
{
  "accommodationInfo": {
    "accessibility": "accessible | non_adapte | commentaires",
    "accessibilityDetails": "string (nullable)",
    "accommodationDescription": "string (required, minLength: 1)",
    "accommodationType": "hebergement_seul | petit_dejeuner | demi_pension | pension_complete",
    "bunkBeds": "boolean",
    "doubleRooms": "boolean",
    "erpRegulations": "boolean",
    "hotelServices": ["blanchisseries", "entretien_locaux"],
    "individualBeds": "boolean",
    "individualStorage": "boolean",
    "lastMayorAuthorizationFile": "string (uuid, nullable)",
    "lastSafetyCertificateFile": "string (uuid, nullable)",
    "localInspection": "boolean",
    "localInspectionDate": "string (date-time, default: 2024-01-01T00:00:00Z, nullable)",
    "maxSleepingCapacity": "number (min: 1)",
    "numberOfBeds": "number",
    "numberOfBunkBeds": "number (nullable)",
    "responseFromOwnerOrOperatorFile": "string (uuid)",
    "singleSexRooms": "boolean",
    "specificAdaptations": "boolean",
    "specificAdaptationsDetails": "string (nullable)",
    "type": "hotel | meuble_tourisme | residence_tourisme | camping | autre"
  },
  "coordinates": {
    "address": "string (required)",
    "email": "string (email format, required)",
    "managerName": "string (required)",
    "phoneNumber1": "string (required, pattern: ^(\\+33|0|0033)[1-9][0-9]{8}$)",
    "phoneNumber2": "string (pattern: ^(\\+33|0|0033)[1-9][0-9]{8}$)"
  },
  "name": "string (required)",
  "transportInfo": {
    "adaptedVehicles": "boolean (required)",
    "excursion": "string (required, minLength: 1)",
    "nearbyTravel": "string (required, minLength: 1)"
  }
}
```

**Description**

| **Properties**                                      | **Type**                                                                       | **Description**                                                                                                                |
| --------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `accommodationInfo.accessibility`                   | `accessible` \| `non_adapte` \| `commentaires`                                 | Accessibilité                                                                                                                  |
| `accommodationInfo.accessibilityDetails`            | `String` (nullable)                                                            | Précisions (optionnel) (si `accommodationInfo.accessibility` === 'commentaire')                                                |
| `accommodationInfo.accommodationDescription`        | `String` (minLength: 1)                                                        | Description du lieu d’hébergement (parties communes et notamment équipements sanitaires)                                       |
| `accommodationInfo.accommodationType`               | `hebergement_seul` \| `petit_dejeuner` \| `demi_pension` \| `pension_complete` | Type de pension                                                                                                                |
| `accommodationInfo.bunkBeds`                        | `Boolean`                                                                      | Pour les lits superposés, les lits « du dessus » seront-ils occupés par des vacanciers ? si (`accommodationInfo.numberOfBeds`) |
| `accommodationInfo.doubleRooms`                     | `Boolean`                                                                      | Les couples de vacanciers bénéficient t-ils de chambres doubles ?                                                              |
| `accommodationInfo.erpRegulations`                  | `Boolean`                                                                      | Le lieu d’hébergement est-il soumis à la réglementation ERP (établissement recevant du public) ?                               |
| `accommodationInfo.hotelServices`                   | `String[]` (`blanchisseries`, `entretien_locaux`)                              | Prestations hôtelières assurées par le lieu d’accueil                                                                          |
| `accommodationInfo.individualBeds`                  | `Boolean`                                                                      | Chaque vacancier bénéficie-t-il d’un couchage individuel ?                                                                     |
| `accommodationInfo.individualStorage`               | `Boolean`                                                                      | Chaque vacancier bénéficie t-il d’un espace de rangement des affaires personnelles ?                                           |
| `accommodationInfo.lastMayorAuthorizationFile`      | `String` (UUID, nullable)                                                      | UUID of a file upload with POST /file `lastMayorAuthorizationFile` or `lastSafetyCertificateFile` must be provided             |
| `accommodationInfo.lastSafetyCertificateFile`       | `String` (UUID, nullable)                                                      | UUID of a file upload with POST /file `lastMayorAuthorizationFile` or `lastSafetyCertificateFile` must be provided             |
| `accommodationInfo.localInspection`                 | `Boolean`                                                                      | Une visite des locaux par l’organisateur a-t-elle été effectuée                                                                |
| `accommodationInfo.localInspectionDate`             | `String` (date-time, ex: 2024-01-01T00:00:00Z, < to today)                     | Date de la dernière visite (si `accommodationInfo.localInspection` === true)                                                   |
| `accommodationInfo.maxSleepingCapacity`             | `Number` (min: 1)                                                              | Nombre maximum de personnes prévues par espace de couchage                                                                     |
| `accommodationInfo.numberOfBeds`                    | `Number`                                                                       | Nombre de lits dans le lieu d'hébergement                                                                                      |
| `accommodationInfo.numberOfBunkBeds`                | `Number` (nullable)                                                            | Nombre de lits superposés inclus (optionnel)                                                                                   |
| `accommodationInfo.responseFromOwnerOrOperatorFile` | `String` (UUID)                                                                | UUID of a file upload with POST /file                                                                                          |
| `accommodationInfo.singleSexRooms`                  | `Boolean`                                                                      | Les femmes et les hommes dorment-ils dans des lieux séparés ?                                                                  |
| `accommodationInfo.specificAdaptations`             | `Boolean`                                                                      | Des aménagements spécifiques des locaux sont-ils prévus pour accueillir les vacanciers ?                                       |
| `accommodationInfo.specificAdaptationsDetails`      | `String` (nullable)                                                            | Précisez les informations concernant l'accessibilité (si `accommodationInfo.specificAdaptations` === true )                    |
| `accommodationInfo.type`                            | `hotel` \| `meuble_tourisme` \| `residence_tourisme` \| `camping` \| `autre`   | Type du lieu d'hébergement                                                                                                     |
| `coordinates.address`                               | `String`                                                                       | Adresse de l'hébergement                                                                                                       |
| `coordinates.email`                                 | `String` (email format)                                                        | Adresse courriel                                                                                                               |
| `coordinates.managerName`                           | `String`                                                                       | Nom du gestionnaire                                                                                                            |
| `coordinates.phoneNumber1`                          | `String` (pattern: `^(\+33\|0\|0033)[1-9][0-9]{8}$)`                           | Numéro de téléphone 1                                                                                                          |
| `coordinates.phoneNumber2`                          | `String` (nullable, pattern: `^(\+33\|0\|0033)[1-9][0-9]{8}$)`                 | Numéro de téléphone 2                                                                                                          |
| `name`                                              | `String`                                                                       | Nom de l'hébergement                                                                                                           |
| `transportInfo.adaptedVehicles`                     | `Boolean`                                                                      | Les véhicules utilisés sont-ils adaptés ?                                                                                      |
| `transportInfo.excursion`                           | `String` (minLength: 1)                                                        | Précisez la fréquence, les distances et le mode de transport utilisé pour les excursions                                       |
| `transportInfo.nearbyTravel`                        | `String` (minLength: 1)                                                        | Précisez la fréquence, les distances et le mode de transport utilisé pour les déplacements de proximité                        |

**Important:** The `coordinates.address` field will be sent to the [adresse.data.gouv.fr API](https://adresse.data.gouv.fr/api-doc/adresse) to parse address information. The first result returned by the API will be used.

validations are done with [zod](https://zod.dev/) the file is available on [github](https://github.com/SocialGouv/vao/blob/main/packages/external-api/src/schemas/accommodation.schema.ts)

**Response Codes:**

- `201 Created`: Accommodation created successfully
- Example response body:

```json
{
  "accommodationInfo": {
    "accessibility": "accessible",
    "accessibilityDetails": "string",
    "accommodationDescription": "string",
    "accommodationType": "hebergement_seul",
    "bunkBeds": true,
    "doubleRooms": true,
    "erpRegulations": true,
    "hotelServices": ["blanchisseries"],
    "individualBeds": true,
    "individualStorage": true,
    "lastMayorAuthorizationFile": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "lastSafetyCertificateFile": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "localInspection": true,
    "localInspectionDate": "2024-01-01T00:00:00Z",
    "maxSleepingCapacity": 1,
    "numberOfBeds": 0,
    "numberOfBunkBeds": 0,
    "responseFromOwnerOrOperatorFile": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "singleSexRooms": true,
    "specificAdaptations": true,
    "specificAdaptationsDetails": "string",
    "type": "hotel"
  },
  "coordinates": {
    "address": {
      "department": "string",
      "id": 0,
      "inseeCode": "string",
      "inseeKey": "string",
      "label": "string",
      "lat": 0,
      "long": 0,
      "postalCode": "string"
    },
    "email": "user@example.com",
    "managerName": "string",
    "phoneNumber1": "+33123456789",
    "phoneNumber2": "+33123456789"
  },
  "name": "string",
  "transportInfo": {
    "adaptedVehicles": true,
    "excursion": "string",
    "nearbyTravel": "string"
  }
}
```

- `200 OK`: Accommodation deleted successfully
- Example response body:

```json
{
  "message": "Item with id 123 successfully deleted."
}
```

- `400 Bad Request`: Possible issues:
- User needs an organism to create accommodation.
- The address could not be found.
- Files are invalid.
- `401 Unauthorized`: Invalid or missing token.
- Too many failed attempts; the IP is banned

#### **DELETE /accommodation/{id}**

**Headers:** \* `Authorization`: Bearer Token (required)

**Params:** \* id (number)

**Response Codes:**

- `400 Bad Request`: Possible issues:
- User needs an organism to create accommodation.
- The address could not be found.
- Files are invalid.
- `401 Unauthorized`: Invalid or missing token.
- Too many failed attempts; the IP is banned
- `403 Forbidden`: You are not authorized to delete this accommodation..

### 2\. **File**

#### **POST /file**

Upload a file. **Headers:**

- `Authorization`: Bearer Token (required)

**Request Body:** The request must include the file in a `multipart/form-data` format:

accepted files: jpeg, pdf, png

we use [magic-bytes.js](https://www.npmjs.com/package/magic-bytes.js) to validate file mimetype + extensions

Example:

```json
{
  "file": "binary data"
}
```

**Response Codes:**

- `200 OK`: File uploaded successfully.
- Example response body:

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

- `400 Bad Request`: Invalid file:
- `401 Unauthorized`: Invalid or missing token.
- Too many failed attempts; the IP is banned

## Exemples

### Create accommodation

```javascript
const API_URL = "https://api.vao.social.gouv.fr/";
const TOKEN = "YOUR_JWT_TOKEN"; // To replace by your token

async function createAccommodation(accommodation) {
  const url = `${API_URL}/accommodation`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(accommodation),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error:", errorData);
      return;
    }

    const data = await response.json();
    console.log("Accommodation created successfully:", data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

const accommodation = {
  accommodationInfo: {
    accessibility: "accessible",
    accessibilityDetails: "string",
    accommodationDescription: "string",
    accommodationType: "hebergement_seul",
    bunkBeds: true,
    doubleRooms: true,
    erpRegulations: true,
    hotelServices: ["blanchisseries"],
    individualBeds: true,
    individualStorage: true,
    lastMayorAuthorizationFile: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    lastSafetyCertificateFile: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    localInspection: true,
    localInspectionDate: "2024-01-01T00:00:00Z",
    maxSleepingCapacity: 1,
    numberOfBeds: 0,
    numberOfBunkBeds: 0,
    responseFromOwnerOrOperatorFile: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    singleSexRooms: true,
    specificAdaptations: true,
    specificAdaptationsDetails: "string",
    type: "hotel",
  },
  coordinates: {
    address: "123 Main St, City, Country",
    email: "manager@example.com",
    managerName: "John Doe",
    phoneNumber1: "+33123456789",
    phoneNumber2: "+33123456789",
  },
  name: "My Accommodation",
  transportInfo: {
    adaptedVehicles: true,
    excursion: "string",
    nearbyTravel: "string",
  },
};

createAccommodation(accommodation);
```

### Delete accommodation

```javascript
const API_URL = "https://api.vao.social.gouv.fr/";
const TOKEN = "YOUR_JWT_TOKEN"; // To replace by your token
const ACCOMMODATION_ID = "123"; // Remplacez par l'ID de l'accommodation à supprimer

// Fonction pour supprimer une accommodation
async function deleteAccommodation() {
  const url = `${API_URL}/accommodation/${ACCOMMODATION_ID}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error:", errorData);
      return;
    }

    const data = await response.json();
    console.log("Accommodation deleted successfully:", data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

// Appel de la fonction
deleteAccommodation();
```

### Post file

```javascript
const API_URL = "https://api.vao.social.gouv.fr/";
const TOKEN = "YOUR_JWT_TOKEN"; // To replace by your token
const FILE_PATH = "./path/to/your/file.txt"; // To replace by the path to the file

// Fonction pour téléverser un fichier
async function uploadFile() {
  const url = `${API_URL}/file`;

  // Préparation du formulaire avec le fichier
  const formData = new FormData();
  const file = new File([await fetch(FILE_PATH).then((res) => res.blob())], "file.txt"); // To replace by the name of the file
  formData.append("file", file);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error:", errorData);
      return;
    }

    const data = await response.json();
    console.log("File uploaded successfully:", data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

uploadFile();
```
