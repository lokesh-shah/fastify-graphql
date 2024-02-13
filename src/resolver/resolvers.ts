import { google } from "googleapis";
import { oauth2Client } from "../Services/commonService";
import dayjs from "dayjs";

const getData = () => {
    return [
        { id: 1, name: "abc" },
        { id: 2, name: "xyz" },
        { id: 3, name: "pqr" },
    ];
};

const calendarService = google.calendar({ version: 'v3', auth: oauth2Client });
const peopleService = google.people({ version: 'v1', auth: oauth2Client });

export const resolvers = {
    ///************** Query  **************/
    Query: {
        users: async () => {
            return getData();
        },
        getUser: async (source: any, args: any, context: any) => {
            return getData()[args.id];
        },
        getCalendarEvents: async (root: any, args: any, context: any) => {
            try {
                const { data } = await calendarService.events.list({
                    calendarId: process.env.CALENDAR_ID,
                    timeMin: new Date().toISOString(),
                    maxResults: 10,
                    singleEvents: true,
                    orderBy: 'startTime',
                    auth: oauth2Client,
                });

                return data?.items?.map((event: any) => ({
                    id: event?.id || '',
                    summary: event?.summary || ''
                }));

            } catch (error: any) {
                console.error('Error fetching calendar events:', error);
            }
        },
        getMyProfile: async (root: any, args: any, context: any) => {
            try {
                const res = await peopleService.people.connections.list({
                    resourceName: 'people/me',
                    pageSize: 10,
                    personFields: 'names,emailAddresses',
                });

                return res?.data?.connections?.map((people: any) =>
                ({
                    resourceName: people?.resourceName,
                    name: people.names ? people.names.map((name: any) => name.displayName).toString() : '',
                    emailAddress: people.emailAddresses ? people.emailAddresses.map((email: any) => email.value).toString() : '',

                }));

            } catch (error: any) {
                console.error('Error fetching people contacts:', error);
            }
        }

    },
    ///************** mutation  **************/
    Mutation: {
        createGoogleEvent: async (_: any, { summary, description, start, end }: { summary: any, description: any, start: any, end: any }) => {
            await calendarService.events.insert({
                calendarId: process.env.CALENDAR_ID,
                auth: oauth2Client,
                requestBody: {
                    summary,
                    description,
                    start: {
                        dateTime: dayjs(start).toISOString(),
                        timeZone: "Asia/Kolkata",
                    },
                    end: {
                        dateTime: dayjs(end).toISOString(),
                        timeZone: "Asia/Kolkata",
                    },
                },
            });
            return "Event created successfully!";
        },
    },
};