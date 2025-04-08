import os, logging, time, math, glob, json
from datetime import timedelta
from tqdm import tqdm
from google import genai
from google.genai import types
from google.api_core import retry
from concurrent.futures import ThreadPoolExecutor, as_completed

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

ExampleDoc01 = """
104-10012-10076 2025 RELEASE UNDER THE PRESIDENT JOHN F. KENNEDY ASSASSINATION RECORDS ACT OF 1992
UNCLASSIFICU USE ONLY 134 SECRET

ROUTING AND RECORD) SHEET

SUBJECT (Optional)
FROM
TO: (Officer designation, room number, building)
DATE
EXTENSION MAN

3-62
FORM 610 USE PREVIOUS EDITIONS
SECRET CONFIDENTIAL INTERNAL UNCLASSIFIED
USE ONLY
Date for FOIA Review on SEP 1976

13-00000

DISPATCH
CLASSIFICATIO

SECRET

TO
Chiefs, Certain Stations and Bases

INFO.

FROM

PROCESSING ACTION

MARKED FOR INDEXING

NO INDEXING REQUIRED

ONLY QUALIFIED DESK
CAN JUDGE INDEXING
MICROFILM
Chief, WOLIME
SUBJECT
Warren Commission Report: Article on the Investigation Conducted by
District Attorney Garrison
ACTION REQUIRED REFERENCES

1. We are forwarding herewith a reprint of the article "A Reporter At Large:
Garrison", published in THE NEW YORKER, 13 July, 1968. It was written by
Edward Jay Epstein, himself author of a book, ("Inquest"), critical of the
Warren Commission Report.

2. The wide-spread campaign of adverse criticism of the U.S., most recently
again provoked by the assassination of Senator Robert Kennedy, appears to have
revived foreign interest in the assassination of his brother, the late President
Kennedy, too. The forthcoming trial of Sirhan, accused of the murder of Senator
Kennedy, can be expected to cause a new wave of criticism and suspicion against
the United States, claiming once more the existence of a sinister "political
murder conspiracy". We are sending you the attached article--based either on
first-hand observation by the author or on other, identified sources--since it
deals with the continuing investigation, conducted by District Attorney Garrison
of New Orleans, La. That investigation tends to keep alive speculations about the
death of President Kennedy, an alleged "conspiracy", and about the possible
involvement of Federal agencies, notably the FBI and CIA.

3. The article is not meant for reprinting in any media. It is forwarded
primarily for your information and for the information of all Station personnel
concerned. If the Garrison investigation should be cited in your area in the
context of renewed anti-U.S. attacks, you may use the article to brief interested.
contacts, especially government and other political leaders, and to demonstrate to
assets (which you may assign to counter such attacks) that there is no hard
evidence of any such conspiracy. In this context, assets may have to explain to
their audiences certain basic facts about the U.S. judicial system, its separation
of state and federal courts and the fact that judges and district attorneys in the
states are usually elected, not appointed: consequently, D.A. Garrison can continue
in office as long as his constituents re-elect him. Even if your assets have to
discuss this in order to refute--or at least weaken--anti-U.S. propaganda of
sufficiently serious impact, any personal attacks upon Garrison (or any other public
personality in the U.S.) must be strictly avoided.

Document Number: 1127-987
for FOIA Review on SEP 1976
Attachment: 1 unclassified article, per para 1

BRIAN R. SLAGHT

CROSS REFERENCE TO DISPATCH SYMBOL AND NUMBER DATE

latt 7/20 CS COPY 19 July 1968

BD - 6614 30 JUL 1968
CLASSIFICATION HQS FILE NUMBER

SECRET 201-289248

13-00000

FIELD DISTRIBUTION

AD Division WH Division NE Division SB/Division
Abidjan Asuncion Amman CI
Accra Bogota Ankara 2 SB/CA
Addis Ababa Brasilia Athens 5 SB/BR 3
Algiers Buenos Aires Beirut SB/C 2
Bangkok Caracas 2 Bombay SB/YA
Bilbao Georgetown Calcutta SB/P
Dakar Guatemala Colombo SB/CI
Dar es Salaam Guayaquil Dacca
Freetown Kingston Istanbul WH/C/CA/PROP 2
Khartoum La Paz Jerusalem WH/CA
Kinshasa Lima Jidda
WH/1,2,3,4,5
Kuala Lumpur Mexico City 2 Kabul WH/7/JTS, CU
Lagos Montevideo Karachi
Lusaka Panama Katmandu 1-D/RR
Mogadiscio Porto Alegre Kuwait 2-DOCA
Monrovia Rio Au Spain Lahore CI/FA
Nairobi Quito Madras CI/ICG
Rabat Recife New Delhi FBID/Weisa
Tripoli Rio de Janeiro 2 Nicosia VTR/SIC
Yaounde San Jose Rawalpindi OTR/Isolation Library
San Salvador Teheran FL/8PG
EUR Division Santiago 2 MPS/PSC
Santo Domingo
Sao Paulo
Berlin 3 Tegucigalpa INTERNAL DISTRIBUTION CS Special Group Offic
Bern Madrid 2
Bonn 5 AP/COP/CA
Brussels FE Division AP/1 C/CA - DC/CA
Copenhagen Bangkok AP/2 2 C/CA/PEG
Frankfurt Djakarta AP/3 CA/EL 3
Geneva Hong Kong AP/L CA/S3 3
Helsinki 2 AP/5 CA/DA
Lisbon 4 Kuala Lumpur AF/6-Ethiopia CA/EA
London 4 Manila C/EUR
Madrid Melbourne E/ONE/CA CA/PROP
Munich (Austria) 3 Okinawa E/G
Paris Peshawar 3 B/AS
Rome Rangoon B/SC
Stockholm Saigon E/BNE
Vienna San Jose 2 E/BC
Vientiane Seoul 2 B/F
Zurich Singapore B/J
Surabaya E/LB
Taipei
Tokyo FE/CA 16
Vientiane
Wellington NE/SA/A
NE/GTA!!
NE/GES T
NF 'COPS
NE/CO/I
"""

ExampleOutput01 = """
{
  "title": "Warren Commission Report: Article on the Investigation Conducted by District Attorney Garrison",
  "document_type": "Dispatch",
  "classification": "John F. Kennedy Assassination",
  "security_level": "SECRET",
  "date": "1968-07-19",
  "origin_agency": "Central Intelligence Agency (CIA)",
  "sender": "Brian R. Slaght (Chief, WOLIME)",
  "recipient": "Chiefs, Certain Stations and Bases",
  "persons_mentioned": [
    "Edward Jay Epstein",
    "District Attorney Jim Garrison",
    "President John F. Kennedy",
    "Senator Robert Kennedy",
    "Sirhan (Sirhan Bishara Sirhan)"
  ],
  "locations_mentioned": [
    "New Orleans, Louisiana"
  ],
  "tags": [
    "CIA",
    "Garrison Investigation",
    "Warren Commission",
    "JFK Assassination",
    "Robert Kennedy",
    "Conspiracy",
    "FOIA",
    "Propaganda"
  ],
  "summary": "A CIA dispatch discussing an article about District Attorney Jim Garrison’s investigation into the assassination of President John F. Kennedy. It provides guidance on using a reprint of an Edward Jay Epstein piece to address or counter foreign interest and conspiracy theories revived following Senator Robert Kennedy’s assassination.",
  "summary_one_paragraph": "This dispatch, signed by Brian R. Slaght of the CIA, forwards a reprint of Edward Jay Epstein’s New Yorker article concerning District Attorney Jim Garrison’s investigation into President Kennedy’s assassination. Noting that conspiracy theories have resurfaced following Senator Robert Kennedy’s murder, the dispatch instructs CIA stations and bases on how to use the article to counter claims of a political murder conspiracy. Recipients are advised to explain the workings of the U.S. judicial system and emphasize the lack of evidence for a plot, while avoiding direct personal attacks on Garrison. The dispatch underscores the sensitive nature of the content, reminding personnel to employ the article discreetly in conversations with local contacts to mitigate anti-U.S. propaganda.",
  "security": "Because this dispatch provides explicit instructions on influencing foreign contacts and assets—such as advising them to refute conspiracy claims without attacking Garrison personally—it reveals internal CIA strategies for responding to political and media controversies. Quoting directly: “If the Garrison investigation should be cited...you may use the article to brief interested contacts...assets may have to explain...Even if your assets have to discuss this...any personal attacks upon Garrison...must be strictly avoided.” Sharing these instructions could highlight CIA involvement in shaping narratives overseas, potentially harming ongoing operations and damaging the CIA’s reputation.",
}
"""

ExampleDoc02 = """
104-10005-10321

2025 RELEASE UNDER THE PRESIDENT JOHN F. KENNEDY ASSASSINATION RECORDS ACT OF 1992

CLASSIFIED MESSAGE T. R. Dumny 12-62
0748 ROUTING:
INDEX
NO INDEX SECRET/RTDAT 1
4
30 September 64 FILE IN OS FILE, NO. 201-4524 2
5
BONN, FRANKFURT, BERLIN, COPENHAGEN, 3
6
REYKJAVIK, PARIS, STOCKHOLM
DIRECTOR THE HAGUE BRUSSELS 30 SEP 64 204 Z

nue, stess, cluez, VR, FILE CIG CEN
DEFERRED
ROUTINE
53690
UN, FRAN, BRLN, COPENJO GMNY CITE DIR
E. PARI, STOC, muda, Hagu, Beas
:
AT/KUDESK/TPMURILLO/CATIJA

KEGTEST TRACES JOACHIM JOESTER DPOB 29 JUL 07 COLOGNE.
:
ITER ENTIRE ADULT CAREER AND AUTHOR CA 30 BOOKS AND NUMEROUS

SPAPER ARTICLES. POST WWII WORKS VERY ANTI-KUBARK, LAST

OK TITLE - OSWALD: ASSASSIN OR FALL GUY? HAS WRITTEN UNDER

UE NAME AND UNDER PSEUDONYMS: FRANZ VON NESSELRODE; H.F.

LIKIN; WALTER KELL; PAUL DELATHUIS.

2. ACCORDING CAPTURED GESTAPO DOCS HE JOINED GERM CP ON

MAY 32 AND HAD MEMBERSHIP NO. 532315. OWNED LENDING LIBRARY

LN AND SOME TIME AFTER MAY 32 WENT USSR WHERE REMAINED UNTIL

3. DURING ABSENCE HIS LIBRARY MANAGED BY FIANCEE ANNA

SCHINSKY LAST RESIDENCE GERMANY BRLN LUETZOWSTRASSE 40
BEI HESS.

Document Number 888-906
for FOIA Review on: JUL 1976 CONTINUED . . . . . . . .
RELEASING OFFICER COORDINATING OFFICERS
GROUP 1
Excluded from automatic
downgrading and
declassification
AUTHENTICATIN
OFFICER
SECRET/RYBAT
REPRODUCTION BY OTHER THAN THE ISSUING OFFICE IS PROHIBITED. Copy

13-00000

CLASSIFIED MESSAGE
ORIG
EXT
DATE
INDEX SECRET/RTDAT ROUTING:
NO INDEX 1
2
FILE IN CS FILE NO. 3
6
TO
FROM: DIRECTOR
CONF:
INFO:
INFO CITE DIR 53690
3. IN MAY 33 FLED TO FRANCE, WAS IN COPE 36-37 BUT EXPELLED
(OR LEFT) EDCAUSE HIS ANTI-DAHISK GOVT WAITINGS. LEFT DENMARK
FOR FRANCE VIA ICELAND. IN 40 IN SWEDEN, MARRIED MAY NILSSON,
CAME US VIA USSR IN 41 AND NATURALIZED CITIZEN SINCE 48

4. WOULD APPRECIATE AS FULL A CHECK AS POSSIBLE, INCLUDING
LOCAL SERVICES AND AVAILABLE OVERT LOCAL PRE-WWI REFERENCES
(PRESS, BOOKS, ETC.) ON JOESTEN AND FIANCEE.

5. FOR BAIN: PLS ALSO CHECK DDC AND REQUEST PHOTOSTATS
ANY DOCS. CAN ADDRESS AND NAME HESS BE CHECKED? ANY CHANCE
LOCATE FIANCEE?

6. ALL ADDRESSERS PLS HANDLE REQUEST URGENTLY AS MATTER
ALSO OF INTEREST TO WARREN COMMISSION. CABLE SUMMARY RESULTS
AND POUCH DETAILS INCLUDING ALL COPDEES AVAILABLE JOESTEN PRE
WWI WRITINGS.

CONTINUED
RELEASING OFFICER COORDINATING OFFICERS
GROUP 1
Facluded from automatic
downgrading and
declassification
AUTHENTICATIN
OFFIDER
Copy
REPRODUCTION BY OTHER THAN THE ISSUING OFFICE IS PROHIBITED.

13-00000

TO
FROM: DIRECTOR
SECR
FILE IN CS FILE NO.
PAGE THREE
INFO CITE DIR
MIC PARASI THROUGK 3 AECEVI IN PUBLIC DOMAIN, AUS
AECEVI MUST FILE AGIRG.OFFICER
END OF MESSAGE

C/EE/06
C/WE/L

COORDINATING OFFICERS
GROUP 1
Excluded from automatic
downgrading and
declassification
AUTHENTICATIN
OFFICER
SEGRET/RVRAT
REPRODUCTION BY OTHER THAN THE ISSUING OFFICE IS PROHIBITED.
"""

ExampleOutput02 = """
{
"title": "Classified Message: Background Check on Joachim Joesten",
"document_type": "Classified Message",
"classification": "John F. Kennedy Assassination",
"security_level": "SECRET/RYBAT",
"date": "1964-09-30",
"origin_agency": "Central Intelligence Agency (CIA)",
"sender": "Director (possible T. R. Dumny reference)",
"recipient": "CIA Stations in Bonn, Frankfurt, Berlin, Copenhagen, Reykjavik, Paris, Stockholm, The Hague, Brussels",
"persons_mentioned": [
    "Joachim Joesten",
    "Anna Schinsky",
    "May Nilsson",
    "Hess (possible fiancé reference)",
    "Franz Von Nesselrode (pseudonym)",
    "H.F. Likin (pseudonym)",
    "Walter Kell (pseudonym)",
    "Paul Delathuis (pseudonym)"
],
"locations_mentioned": [
    "Cologne, Germany",
    "Berlin, Germany",
    "USSR",
    "France",
    "Denmark",
    "Iceland",
    "Sweden",
    "United States"
],
"tags": [
    "CIA",
    "Warren Commission",
    "FOIA",
    "Joachim Joesten",
    "Background Check",
    "Anti-KUBARK",
    "Secret/RYBAT"
],
"summary": "A classified message requesting urgent background checks on Joachim Joesten, an author critical of the CIA (referred to as KUBARK) and writer of 'Oswald: Assassin or Fall Guy?'. The dispatch instructs several CIA stations in Europe to gather information, including personal details about Joesten’s fiancée, from local services and pre-World War I records. The intelligence is sought partly due to Joesten’s relevance to the Warren Commission’s inquiries.",
"summary_one_paragraph": "Dated 30 September 1964, this secret communication from the CIA Director instructs European stations to conduct comprehensive local and overt checks on Joachim Joesten, an anti-KUBARK author known for his book on Lee Harvey Oswald. The message details Joesten’s background—his membership in the German Communist Party, his travels through the USSR, France, Denmark, Sweden, and eventually the United States—and requests photostats or documentation of any pre–World War II materials connected to him or his fiancée, Anna Schinsky. Emphasizing the Warren Commission’s interest, the cable urges immediate action to confirm Joesten’s history and references his pseudonyms and prior anti-U.S. writings.",
"security": "This document reveals CIA activities directed at gathering intelligence on an author potentially influencing public discourse about President Kennedy’s assassination. It specifies collecting data from foreign intelligence services and local records on Joesten’s personal background, membership in the German Communist Party, and relationships. Exposing these requests could compromise CIA cooperation with foreign agencies, highlight infiltration of public records for intelligence purposes, and cast light on how the agency monitors critics of its operations.",
"conspiracy": "This message references Joesten's book on Oswald and acknowledges the Warren Commission’s interest, but it does not reveal new or definitive information about the JFK assassination. Rather, it focuses on investigating the author’s background and beliefs, not clarifying who killed JFK or why.",
"allies": "No exposure to allies – although it requests cooperation from U.S. allies (e.g., European intelligence services), it does not specifically reveal damaging information."
}
"""

output_dir = "/Users/stephenwalker/Code/ecosystem/jfk-files/json/2025"
schema_json = "schema.json"
model = "gemini-2.0-flash"
max_rpm = 500  # requests per minute

# Function to build GenAI schema object from JSON
def build_schema_from_json(json_data):
    t = json_data.get("type")
    match t:
        case "object":
            properties = {}
            for prop_name, prop_data in json_data["properties"].items():
                properties[prop_name] = build_schema_from_json(prop_data)
            return genai.types.Schema(
                type=genai.types.Type.OBJECT,
                required=json_data.get("required", json_data["required"]),
                properties=properties
            )
        case "string":
            return genai.types.Schema(
                type=genai.types.Type.STRING,
                description=json_data.get("description", "")
            )
        case "array":
            return genai.types.Schema(
                type=genai.types.Type.ARRAY,
                description=json_data.get("description", ""),
                items=build_schema_from_json(json_data["items"])
            )
        case _:
            raise ValueError(f"Unsupported type: {t}")

# Load schema JSON file
schema_file_path = os.path.join(os.path.dirname(__file__), schema_json)
with open(schema_file_path, 'r', encoding='utf-8') as schema_file:
    schema_data = json.load(schema_file)
response_schema = build_schema_from_json(schema_data)

generate_content_config = types.GenerateContentConfig(
    temperature=1,
    top_p=0.95,
    top_k=40,
    max_output_tokens=8192,
    response_mime_type="application/json",
    response_schema=response_schema,
    system_instruction=[
        types.Part.from_text(text="""Please output JSON according to the schema."""),
    ],
)

# Display retry status
logger = logging.getLogger("google.api_core.retry")
logger.setLevel(logging.DEBUG)
logger.addHandler(logging.StreamHandler())

# Function to handle concurrent requests
def generate_content_retry(text):
    for attempt in range(5):  # Retry up to 5 times
        try:
            response = client.models.generate_content(
                model=model,
                config=generate_content_config,
                contents=text,
            )
            return response.text
        except genai.errors.ClientError as e:
            if "429" in str(e) or "quota" in str(e).lower() or "resource exhausted" in str(e).lower():  # Resource exhausted
                wait_time = 60  # Wait for 60 seconds before retrying
                print(f"Quota exceeded. Waiting for {wait_time} seconds before retrying...")
                time.sleep(wait_time)
            else:
                raise  # Re-raise the exception if it's not a quota issue

# Process a single file
def process_single_file(md_file):
    json_file = os.path.join(output_dir, os.path.basename(md_file).removesuffix('.md') + '.json')
    
    # Skip if JSON file already exists
    if os.path.exists(json_file):
        print(f"Skipping {md_file} - JSON already exists")
        return None
        
    with open(md_file, 'r', encoding='utf-8') as f:
        text = f.read()
        
    # Create a single conversation with examples and the current document
    conversation = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=ExampleDoc01)]
        ),
        types.Content(
            role="model",
            parts=[types.Part.from_text(text=ExampleOutput01)]
        ),
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=ExampleDoc02)]
        ),
        types.Content(
            role="model",
            parts=[types.Part.from_text(text=ExampleOutput02)]
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="Ok, now summarize the following document in json format according to the provided schema:"),
                types.Part.from_text(text=text)
            ]
        )
    ]
    
    try:
        json_output = generate_content_retry(conversation)
        if json_output:
            json_data = json.loads(json_output)
            with open(json_file, 'w', encoding='utf-8') as f:
                f.write(json.dumps(json_data, indent=2, ensure_ascii=False))
            return md_file
        else:
            print(f"Failed to generate output for {md_file}")
            return None
    except Exception as e:
        print(f"Error processing {md_file}: {e}")
        return None

# Process files with concurrent execution and rate limiting
def process_files_concurrently(md_files, max_workers=25, chunk_size=100, pause_seconds=10):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Process files in chunks to manage rate limits
    for i in range(0, len(md_files), chunk_size):
        chunk = md_files[i:i+chunk_size]
        print(f"Processing chunk {i//chunk_size + 1}/{math.ceil(len(md_files)/chunk_size)} ({len(chunk)} files)")

        completed = 0
        processed_in_chunk = 0 # Track files actually processed in this chunk
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {executor.submit(process_single_file, md_file): md_file for md_file in chunk}

            for future in tqdm(as_completed(futures), total=len(futures), desc="Processing files"):
                result = future.result()
                if result:
                    completed += 1
                    processed_in_chunk += 1 # Increment if a file was processed

        print(f"Completed {completed}/{len(chunk)} files in current chunk ({processed_in_chunk} actually processed)")

        # Pause between chunks only if it's not the last chunk AND if any files were actually processed in this chunk
        if i + chunk_size < len(md_files) and processed_in_chunk > 0:
            print(f"Pausing for {pause_seconds} seconds before next chunk...")
            time.sleep(pause_seconds)
        elif i + chunk_size < len(md_files) and processed_in_chunk == 0:
             print(f"Skipping pause as no files were processed in this chunk.")


if not os.path.exists(output_dir):
    os.makedirs(output_dir)

md_files = sorted(glob.glob('/Users/stephenwalker/Code/ecosystem/jfk-files/md/2025/*.md'))
# Choose parameters based on API limits and performance needs
process_files_concurrently(md_files, max_workers=5, chunk_size=max_rpm, pause_seconds=10)