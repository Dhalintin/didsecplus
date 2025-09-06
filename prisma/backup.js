generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

enum Role {
  superAdmin
  admin
  user
}

enum Status {
  active
  investigating
  resolved
}

enum Source {
  phone
  app
  web
}

enum TicketStatus {
  open
  in_progress
  resolved
}

enum Priority {
  high
  mid
  low
}

model User {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  email             String    @unique
  lastname          String
  firstname         String
  username          String
  password          String
  phone             String?
  role              Role
  created_at        DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  applicants            Applicant[] @relation("UserAlert")
}

model User {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  email             String    @unique
  username          String?   
  name              String?   
  password          String
  phone             String?
  role              Role
  location          String?   // e.g., "Lagos, Ikeja"
  device            Device?   // e.g., Android, iOS, Web, Unknown
  created_at        DateTime  @default(now()) // ISO 8601 UTC string
  updatedAt         DateTime  @updatedAt // ISO 8601 UTC string
  tickets           Ticket[]  @relation("UserTickets") // Relation for ticketIds

  @@index([email])
  @@index([username])
  @@index([role])
  @@index([location])
}

model Alert {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  userId            String    @db.ObjectId
  user              User      @relation("UserAlert", fields: [userId], references: [id], onDelete: SetNull)
  title             String
  description       String?
  status            Status    @default(active)
  source            Source
  latitude          Float
  longitude         Float
  state             String
  lga               String
  assigned_unit     String?
  created_at        DateTime  @default(now()) @index
  updated_at        DateTime  @updatedAt
  tickets           Ticket[]  @relation("AlertTicket")

  @@index([userId])
  @@index([status])
  @@index([state])
}

model Ticket {
  id                String          @id @default(auto()) @map("_id") @db.ObjectId
  alert_Id          String          @unique @db.ObjectId
  alert             Alert           @relation("AlertTicket", fields: [alert_Id], references: [id], onDelete: Cascade)
  title             String
  description       String?
  status            TicketStatus    @default(open)
  priority          Priority        @default(low)
  created_by        String?
  assigned_to       String?
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  note              String?
  @@index([created_at])
}

model State {
  id        String   @id @map("_id")
  name      String   
  centroid  Float[2]  
  lgas      Lga[]    @relation("StateLga")
}

model Lga {
  id        String   @id @map("_id")
  name      String   
  stateId   String   
  state     State    @relation("StateLga", fields: [stateId], references: [id], onDelete: Cascade)
  geometry  Json     

  @@index([stateId])
  @@index([geometry], type: Spatial)
}

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

enum Role {
  superAdmin
  admin
  citizen
}

enum Status {
  active
  investigating
  resolved
}

enum Source {
  phone
  app
  web
}

enum TicketStatus {
  open
  in_progress
  resolved
}

enum Priority {
  high
  mid
  low
}

enum Device {
  Android
  iOS
  Web
  Unknown
}

model User {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  email             String    @unique
  username          String?   
  name              String?   
  password          String
  phone             String?
  role              Role
  location          String?   
  device            Device?   
  created_at        DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  tickets           Ticket[]  @relation("UserTickets") // Relation for ticketIds

  @@index([email])
  @@index([username])
  @@index([role])
  @@index([location])
}

model Alert {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  userId            String    @db.ObjectId
  user              User      @relation("UserAlert", fields: [userId], references: [id], onDelete: SetNull)
  title             String
  description       String?
  status            Status    @default(active)
  source            Source
  latitude          Float     
  longitude         Float     
  state             String
  lga               String
  assigned_unit     String?
  created_at        DateTime  @default(now()) @index 
  updated_at        DateTime  @updatedAt 
  tickets           Ticket[]  @relation("AlertTicket")

  @@index([userId])
  @@index([status])
  @@index([state])
}

model Ticket {
  id                String          @id @default(auto()) @map("_id") @db.ObjectId
  alert_Id          String          @unique @db.ObjectId
  alert             Alert           @relation("AlertTicket", fields: [alert_Id], references: [id], onDelete: Cascade)
  created_by        String?         @db.ObjectId
  user              User?           @relation("UserTickets", fields: [created_by], references: [id], onDelete: SetNull)
  title             String
  description       String?
  status            TicketStatus    @default(open)
  priority          Priority        @default(low)
  assigned_to       String?
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  note              String?

  @@index([created_at])
  @@index([created_by])
}

model State {
  id        String    @id @map("_id")
  name      String
  capital   String
  centroid  Float[2]  
  lgas      Lga[]     @relation("StateLga")
}

model Lga {
  id        String    @id @map("_id")
  name      String
  stateId   String
  state     State     @relation("StateLga", fields: [stateId], references: [id], onDelete: Cascade)
  geometry  Json      
  @@index([stateId])
  @@index([geometry], type: Spatial)
}



//Another

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

enum Role {
  superAdmin
  admin
  citizen
}

enum Status {
  active
  investigating
  resolved
}

enum Source {
  phone
  app
  web
}

enum TicketStatus {
  open
  in_progress
  resolved
}

enum Priority {
  high
  mid
  low
}

enum Device {
  Android
  iOS
  Web
  Unknown
}

model User {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  email             String    @unique
  username          String?   
  name              String?   
  password          String
  phone             String?
  role              Role
  location          String?   
  device            Device?   
  created_at        DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  tickets           Ticket[]  @relation("UserTickets")

  @@index([email])
  @@index([username])
  @@index([role])
  @@index([location])
}

model Alert {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  userId            String    @db.ObjectId
  user              User      @relation("UserAlert", fields: [userId], references: [id], onDelete: SetNull)
  title             String
  description       String?
  status            Status    @default(active)
  source            Source
  latitude          Float     
  longitude         Float     
  state             String
  lga               String
  assigned_unit     String?
  created_at        DateTime  @default(now()) @index
  updated_at        DateTime  @updatedAt
  tickets           Ticket[]  @relation("AlertTicket")

  @@index([userId])
  @@index([status])
  @@index([state])
}

model Ticket {
  id                String          @id @default(auto()) @map("_id") @db.ObjectId
  alert_Id          String          @unique @db.ObjectId
  alert             Alert           @relation("AlertTicket", fields: [alert_Id], references: [id], onDelete: Cascade)
  created_by        String?         @db.ObjectId
  user              User?           @relation("UserTickets", fields: [created_by], references: [id], onDelete: SetNull)
  title             String
  description       String?
  status            TicketStatus    @default(open)
  priority          Priority        @default(low)
  assigned_to       String?
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  note              String?

  @@index([created_at])
  @@index([created_by])
}

model State {
  id        String    @id @map("_id")
  name      String
  capital   String
  centroid  Float[]
  lgas      Lga[]     @relation("StateLga")
}

model Lga {
  id        String    @id @map("_id")
  name      String
  stateId   String
  state     State     @relation("StateLga", fields: [stateId], references: [id], onDelete: Cascade)
  geometry  Json      
  @@index([stateId])
  @@index([geometry], type: Spatial)
}

