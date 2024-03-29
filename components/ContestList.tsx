// ContestList.tsx
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    Text,
    View,
    TouchableWithoutFeedback,
    Linking,
    StyleSheet,
} from 'react-native';
import tw from 'twrnc';
import { fetchData } from '../services/api';
import { parse, format } from 'date-fns';
import { PermissionsAndroid, Platform } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import * as AddCalendarEvent from 'react-native-add-calendar-event';

interface Contest {
    id: number;
    event: string;
    host: string;
    start: string;
    href: string;
    resource: string;
    end: string;
}


// const contests = [
//     {
//         id: 45256482,
//         event: "ProjectEuler+",
//         host: "hackerrank.com",
//         start: "07.07 Mon 21:08",
//         href: "https://hackerrank.com/contests/projecteuler",
//         resource: "hackerrank.com",
//         end: "31.07 Wed 00:00"
//     },
//     {
//         id: 43439519,
//         event: "Marathon Match Practice: SnakeCharmer",
//         host: "topcoder.com",
//         start: "04.05 Tue 17:08",
//         href: "https://topcoder.com/challenges/971eb6a9-59d3-49da-a465-e9b70f1ce019",
//         resource: "topcoder.com",
//         end: "04.05 Sat 17:14"
//     },
//     {
//         id: 42153773,
//         event: "JFP12",
//         host: "spoj.com",
//         start: "27.03 Mon 16:30",
//         href: "https://www.spoj.com/JFP12/",
//         resource: "spoj.com",
//         end: "31.03 Sun 16:30"
//     },
//     {
//         id: 42623949,
//         event: "CAFA 5 Protein Function Prediction [biology]",
//         host: "kaggle.com",
//         start: "19.04 Wed 01:34",
//         href: "https://www.kaggle.com/competitions/cafa-5-protein-function-prediction",
//         resource: "kaggle.com",
//         end: "22.12 Fri 05:29"
//     },
//     {
//         id: 48382040,
//         event: "CharmHealth CodeRx Hackathon. Hackathon. Online",
//         host: "hackerearth.com",
//         start: "13.09 Wed 21:30",
//         href: "https://charmhealth.hackerearth.com/",
//         resource: "hackerearth.com",
//         end: "15.01 Mon 13:25"
//     },
//     // Add more contests as needed
// ];

const ContestList: React.FC = () => {
    const [contests, setContests] = useState<Contest[]>([]);

    useEffect(() => {
        const loadContests = async () => {
            try {
                const data = await fetchData();
                setContests(data); // Update state with the fetched data
            } catch (error) {
                console.error('Error loading contests:', error);
            }
        };

        loadContests();
    }, []); // Empty dependency array to run the effect only once


    const formatDateString = (dateString: string): string => {
        const date = parse(dateString, 'dd.MM EEE HH:mm', new Date()); // Use the correct format
        return isNaN(date.getTime()) ? 'Invalid date' : format(date, "dd/MM/yyyy HH:mm");
    };

    const addToCalendar = async (contest: Contest) => {
        try {
            const parsedStartDate = parse(contest.start, 'dd.MM EEE HH:mm', new Date());
            const parsedEndDate = parse(contest.end, 'dd.MM EEE HH:mm', new Date());

            if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
                throw new Error('Invalid date format');
            }

            const formattedStartDate = parsedStartDate.toISOString();
            const formattedEndDate = parsedEndDate.toISOString();

            const eventConfig = {
                title: contest.event,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                location: contest.resource,
                url: contest.href,
            };

            // Request calendar permissions (Android):
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_CALENDAR,
                    {
                        title: 'Calendar Permission',
                        message: 'This app needs calendar access to add events',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.warn('Calendar permission denied');
                    showMessage({
                        message: 'Calendar permission is required to add events. Please grant permission to proceed.',
                        type: 'info',
                    });
                    return;
                }
            }

            // Add event to calendar:
            await AddCalendarEvent.presentEventCreatingDialog(eventConfig);
            showMessage({
                message: `Event "${contest.event}" added to your calendar successfully!`,
                type: 'success',
            });
            console.log('Event added to calendar successfully');
        } catch (error) {
            console.error('Error adding event to calendar:', error);
            showMessage({
                message: 'Error adding event to calendar. Please try again later.',
                type: 'danger',  // Assuming "danger" is a valid type for error messages
            });
        }
    };
    return (
        <ScrollView style={tw`py-30px w-[320px]`}>
            <Text style={[tw`text-[#fff] text-[1rem] pb-8  text-center`, { fontFamily: 'Roboto-Light' }]}>"It’s not a bug; it’s an undocumented feature"</Text>
            <Text style={[tw`text-[#fff] text-[2rem]  text-center`, { fontFamily: 'Roboto-Bold' }]}>CONTEST LIST</Text>
            <View style={tw`mt-50px`}>
                {contests.map((contest) => (
                    <TouchableWithoutFeedback key={contest.id} onPress={() => addToCalendar(contest)}>
                        <View style={tw`mx-4 py-4 px-4  rounded-2xl bg-[#FF824D] my-2`} >
                            <View style={styles.container}>
                                <Text style={[tw`text-center text-[1.1rem] text-[#161716] `, { fontFamily: 'Roboto-Black' }]}>
                                    {contest.host.toUpperCase().slice(0, 12).split('.')[0]}
                                </Text>
                                <View style={tw`pl-3`}>
                                    <Text style={tw`font-medium text-[#161716] text-[0.7rem] text-center`}>{formatDateString(contest.start)}</Text>
                                    <Text style={tw`font-medium text-[#161716] text-[0.7rem] text-center`}>{formatDateString(contest.end)}</Text>
                                </View>
                            </View>
                            <View >
                                <Text style={tw`font-bold text-[#161716] text-[0.9rem] text-center mt-1`}>
                                    {contest.event.length > 5 ? `${contest.event.slice(0, 25)}...` : contest.event}
                                </Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                ))}
            </View>
        </ScrollView>
    );
};

export default ContestList;



const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
});
