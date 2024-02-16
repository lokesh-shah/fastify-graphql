import { google } from "googleapis";
import { oauth2Client } from "../Services/commonService";

const getData = () => {
    return [
        { id: 1, name: "abc" },
        { id: 2, name: "xyz" },
        { id: 3, name: "pqr" },
    ];
};

const calendarService = google.calendar({ version: 'v3', auth: oauth2Client });
const peopleService = google.people({ version: 'v1', auth: oauth2Client });

const formatGoogleCalendarEvent = (data: any) => {
    return {
        id: data.id || '',
        summary: data.summary || '',
        description: data.description || '',
        start: data.start.dateTime || '',
        end: data.end.dateTime || '',
    };
};

const formattedContact = (createdContact: any) => {
    return {
        resourceName: createdContact?.resourceName || '',
        names: createdContact?.names ? createdContact.names.map((name: any) => name.displayName).toString() : '',
        emailAddresses: createdContact?.emailAddresses ? createdContact?.emailAddresses?.map((email: any) => email.value).toString() : '',
        phoneNumbers: createdContact?.phoneNumbers ? createdContact?.phoneNumbers?.map((phone: any) => phone.value).toString() : ''
    }
};

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
                    summary: event?.summary || '',
                    description: event?.description || '',
                    start: event?.start?.dateTime || '',
                    end: event?.end?.dateTime || ''
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
                    personFields: 'names,emailAddresses,phoneNumbers',
                });


                return res?.data?.connections?.map((people: any) => {
                    return ({
                        resourceName: people?.resourceName,
                        names: people?.names ? people.names.map((name: any) => name.displayName).toString() : '',
                        emailAddresses: people?.emailAddresses ? people?.emailAddresses?.map((email: any) => email.value).toString() : '',
                        phoneNumbers: people?.phoneNumbers ? people?.phoneNumbers?.map((phone: any) => phone.value).toString() : ''
                    })
                });

            } catch (error: any) {
                console.error('Error fetching people contacts:', error);
            }
        }

    },
    ///************** mutation  **************/

    Mutation: {
        createGoogleEvent: async (_: any, { summary, description, start, end }: any, context: any) => {
            try {
                const event = {
                    summary,
                    description,
                    start: {
                        dateTime: start,
                        timeZone: 'Asia/Kolkata',
                    },
                    end: {
                        dateTime: end,
                        timeZone: 'Asia/Kolkata',
                    },
                };

                const response = await calendarService.events.insert({
                    calendarId: process.env.CALENDAR_ID,
                    requestBody: event,
                });

                return formatGoogleCalendarEvent(response.data);
            } catch (error) {
                console.error("Error adding event: ", error);
                throw new Error("Failed to add event");
            }
        },

        createNewContact: async (_: any, { names, emailAddresses, phoneNumbers }: any) => {
            try {
                const contactData = {
                    names: [{
                        displayName: names,
                        givenName: names,
                        displayNameLastFirst: names,
                        unstructuredName: names
                    }],
                    emailAddresses: [{ value: emailAddresses }],
                    phoneNumbers: [{ value: phoneNumbers }],
                };

                const response = await peopleService.people.createContact({
                    requestBody: contactData,
                });

                return formattedContact(response.data);
            } catch (error) {
                console.error("Error adding new contact: ", error);
                throw new Error("Failed to add Contact");
            }
        }
    },
};