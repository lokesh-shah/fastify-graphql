export const typeDef = `

type User {
  id:ID!,
  name:String!
}

type Event {
    id:ID!
    summary: String!
    description: String!
    start:String!
    end:String!
}

type Person {
    resourceName:String!
    name:String!
    emailAddress:String!
}

type Query{
  users:[User]!,
  getUser(id:ID!): User ,
  getCalendarEvents: [Event!],
  getMyProfile: [Person!]
}


type Mutation {
  createGoogleEvent(summary: String!, description:String!, start: String!, end: String!): Event!
}
`;