import dotenv from 'dotenv';
dotenv.config({})
import fastify from "fastify";
import mercurius from 'mercurius';
import { typeDef } from './schema/schema';
import { resolvers } from './resolver/resolvers';
import { oauth2Client } from './Services/commonService';

const app = fastify(
    { logger: true }
);

const PORT = 5000;

const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/contacts'
];


app.register(mercurius, {
    schema: typeDef,
    resolvers,
    graphiql: true
})

app.get("/google", (request, reply) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
    });
    reply.redirect(url);
});


app.get("/google/redirect", async (request: any, reply) => {
    const code = request.query.code;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens)
        reply.redirect('http://localhost:5000/graphiql')

    } catch (error) {
        console.error("Error getting tokens:", error);
        reply.status(500).send({ error: "Failed to authenticate user" });
    }
});


const start = async () => {
    try {
        app.listen({ port: PORT }, () => {
            console.log(`Server is running on ${PORT}`);
        })
    } catch (error) {
        app.log.error(error);
        process.exit(1)
    }
}

start()


