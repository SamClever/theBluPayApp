export const entertainmentServices = [
    { id: '1', name: 'TV', icon: icons.television, iconColor: '#3F51B2', backgroundColor: 'rgba(63, 81, 178, .12)', onPress: 'PayTV' },
    { id: '2', name: 'Music', icon: icons.music, iconColor: '#EA1E61', backgroundColor: 'rgba(234, 30, 97, .12)', onPress: 'PayMusic' },
    { id: '3', name: 'Cinema', icon: icons.cinema, iconColor: '#FFC02D', backgroundColor: 'rgba(255, 192, 45, .12)', onPress: 'PayCinema' },
    { id: '4', name: 'Events', icon: icons.event, iconColor: '#00BCD3', backgroundColor: 'rgba(0, 188, 211, .12)', onPress: 'PayEvents' },
    { id: '5', name: 'Sports', icon: icons.sports, iconColor: '#8BC255', backgroundColor: 'rgba(139, 194, 85, .12)', onPress: 'PaySports' },
    { id: '6', name: 'Gaming', icon: icons.games, iconColor: '#F54336', backgroundColor: 'rgba(245, 67, 54, .12)', onPress: 'PayGaming' },
]
import { COLORS, images, socials } from "../constants";
import icons from "../constants/icons";


export const categories = [
    // Utility Bill Payments
    { id: '1', name: 'LUKU (Electricity)', icon: icons.electricity, iconColor: '#FFD300', backgroundColor: 'rgba(255, 211, 0, .12)', onPress: 'PayBillsLUKU' },
    { id: '2', name: 'DAWASA / ZAWA (Water)', icon: icons.water, iconColor: '#1A96F0', backgroundColor: 'rgba(26, 150, 240, .12)', onPress: 'PayBillsWater' },
    // Government Fees & Public Services
    { id: '3', name: 'TRA Payments', icon: icons.tax, iconColor: '#FF981F', backgroundColor: 'rgba(255, 152, 31, .12)', onPress: 'PayTRAPayments' },
    { id: '4', name: 'NIDA Fees', icon: icons.idCard, iconColor: '#673AB3', backgroundColor: 'rgba(103, 58, 179, .12)', onPress: 'PayNIDAFees' },
    { id: '5', name: 'Driving License', icon: icons.license, iconColor: '#3F51B2', backgroundColor: 'rgba(63, 81, 178, .12)', onPress: 'PayDrivingLicense' },
    { id: '6', name: 'Immigration Services', icon: icons.passport, iconColor: '#9D28AC', backgroundColor: 'rgba(157, 40, 172, .12)', onPress: 'PayImmigration' },
    { id: '7', name: 'Municipal Council Fees', icon: icons.municipal, iconColor: '#FF5726', backgroundColor: 'rgba(255, 87, 38, .12)', onPress: 'PayMunicipal' },
    { id: '8', name: 'NHIF', icon: icons.health, iconColor: '#8BC255', backgroundColor: 'rgba(139, 194, 85, .12)', onPress: 'PayNHIF' },
    // Education Payments
    { id: '9', name: 'NECTA', icon: icons.education, iconColor: '#00BCD3', backgroundColor: 'rgba(0, 188, 211, .12)', onPress: 'PayNECTA' },
    { id: '10', name: 'School & University Fees', icon: icons.school, iconColor: '#607D8A', backgroundColor: 'rgba(96, 125, 138, .12)', onPress: 'PaySchoolFees' },
    { id: '11', name: 'Student Loans Board (HESLB)', icon: icons.loan, iconColor: '#FFC02D', backgroundColor: 'rgba(255, 192, 45, .12)', onPress: 'PayHESLB' },
    // Transport & Travel
    { id: '12', name: 'Ferry Tickets', icon: icons.ferry, iconColor: '#EA1E61', backgroundColor: 'rgba(234, 30, 97, .12)', onPress: 'PayFerryTickets' },
    { id: '13', name: 'Flight Tickets', icon: icons.flight, iconColor: '#22D3EE', backgroundColor: 'rgba(34, 211, 238, .12)', onPress: 'PayFlightTickets' },
];

export const activities = [
    {
        id: "1",
        name: "Leslie Alexander",
        amount: "+ $129.5",
        type: "Preapproved Payment",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "2",
        name: "Savannah Nguyen",
        amount: "- $46.75",
        type: "Transfer Bank",
        status: "Completed",
        transactionType: "Debit"
    },
    {
        id: "3",
        name: "Cameron Williamson",
        amount: "+ $86.26",
        type: "Preapproved Payment",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "4",
        name: "Brooklyn Simmons",
        amount: "+ $230.12",
        type: "Direct Deposit",
        status: "Pending",
        transactionType: "Credit"
    },
    {
        id: "5",
        name: "Ralph Edwards",
        amount: "- $150.00",
        type: "Online Purchase",
        status: "Completed",
        transactionType: "Debit"
    },
    {
        id: "6",
        name: "Courtney Henry",
        amount: "+ $75.5",
        type: "Cash Deposit",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "7",
        name: "Kathryn Murphy",
        amount: "- $300.00",
        type: "Bill Payment",
        status: "Completed",
        transactionType: "Debit"
    },
    {
        id: "8",
        name: "Wade Warren",
        amount: "+ $120.00",
        type: "Refund",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "9",
        name: "Esther Howard",
        amount: "- $22.95",
        type: "Transfer Bank",
        status: "Pending",
        transactionType: "Debit"
    },
    {
        id: "10",
        name: "Jenny Wilson",
        amount: "+ $50.00",
        type: "Cashback Reward",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "11",
        name: "Esther Howard",
        amount: "- $24.95",
        type: "Transfer Bank",
        status: "Pending",
        transactionType: "Debit"
    },
    {
        id: "12",
        name: "Jenny Wilson",
        amount: "+ $50.00",
        type: "Cashback Reward",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "13",
        name: "Ana Jacqueline",
        amount: "- $300.00",
        type: "Online Purchase",
        status: "Completed",
        transactionType: "Debit"
    },
    {
        id: "14",
        name: "Lucien Jack",
        amount: "+ $59.5",
        type: "Cash Deposit",
        status: "Completed",
        transactionType: "Credit"
    },
];

export const notifications = [
    {
        id: "1",
        title: "Security Updates!",
        description: "Now Payza has a Two-Factor Authentication. Try it now to make your account more secure.",
        date: "2024-06-04T04:52:06.501Z",
        time: "4:52 PM",
        type: "Security",
        isNew: true
    },
    {
        id: "2",
        title: "Multiple Card Features!",
        description: "Now you can also connect Payza with multiple MasterCard & Visa. Try the service now.",
        date: "2024-06-04T04:52:06.501Z",
        time: "08:52 PM",
        type: "Card",
        isNew: true
    },
    {
        id: "3",
        title: "New Updates Available!",
        description: "Update Payza now to get access to the latest features for easier in making online payments.",
        date: "2024-06-04T07:12:06.501Z",
        time: "07:12 AM",
        type: "Update",
        isNew: false
    },
    {
        id: "4",
        title: "Credit Card Connected!",
        description: "Your credit card has been successfully linked with Payza. Enjoy our services.",
        date: "2024-06-04T11:14:06.501Z",
        time: "11:14 AM",
        type: "Payment",
        isNew: false
    },
    {
        id: "5",
        title: "Account Setup Successful!",
        description: "Your account creation is successful, you can now experience our services.",
        date: "2024-06-03T08:39:06.501Z",
        time: "08:39 AM",
        type: "Account",
        isNew: false
    },
    {
        id: "6",
        title: "Payment Received!",
        description: "You have received a payment of $500.00. Check your account for more details.",
        date: "2024-06-02T09:52:06.501Z",
        time: "09:52 AM",
        type: "Payment",
        isNew: false
    },
    {
        id: "7",
        title: "Scheduled Maintenance!",
        description: "Payza will undergo scheduled maintenance on June 10, 2024, from 02:00 AM to 04:00 AM.",
        date: "2024-06-01T03:22:06.501Z",
        time: "03:22 AM",
        type: "Account",
        isNew: false
    },
    {
        id: "8",
        title: "New Payment Methods!",
        description: "Payza now supports Apple Pay and Google Pay for your convenience.",
        date: "2024-05-30T06:15:06.501Z",
        time: "06:15 AM",
        type: "Payment",
        isNew: false
    },
    {
        id: "9",
        title: "Referral Bonus!",
        description: "Invite friends to Payza and earn up to $50 for each referral.",
        date: "2024-05-29T10:00:06.501Z",
        time: "10:00 AM",
        type: "Card",
        isNew: false
    },
    {
        id: "10",
        title: "Password Change Successful!",
        description: "Your password has been changed successfully. If this was not you, please contact support immediately.",
        date: "2024-05-28T04:52:06.501Z",
        time: "04:52 AM",
        type: "Security",
        isNew: false
    }
];

export const allContacts = [
    {
        id: "1",
        name: "Abigail Vaniasiwa",
        email: "abigail_vaniasiwa@gmail.com",
        image: images.user1
    },
    {
        id: "2",
        name: "Adaline Gutenberg",
        email: "adaline_gutenberg@gmail.com",
        image: images.user2
    },
    {
        id: "3",
        name: "Alan Williamson",
        email: "alan_williamson@gmail.com",
        image: images.user3
    },
    {
        id: "4",
        name: "Albert Alenxander",
        email: "albert_alenxander@gmail.com",
        image: images.user4
    },
    {
        id: "5",
        name: "Alyssa Russel",
        email: "alyssa_russel@gmail.com",
        image: images.user5
    },
    {
        id: "6",
        name: "Anthony Robertson",
        email: "anthony_robertson@gmail.com",
        image: images.user6
    },
    {
        id: "7",
        name: "Arianna Cooper",
        email: "arianna_cooper@gmail.com",
        image: images.user7
    },
    {
        id: "8",
        name: "Arthur Watson",
        email: "arthur_watson@gmail.com",
        image: images.user8
    },
    {
        id: "9",
        name: "Aubrey Watson",
        email: "aubrey_watson@gmail.com",
        image: images.user9
    },
    {
        id: "10",
        name: "Jeannette Liliana",
        email: "jeannette_liliana@gmail.com",
        image: images.user10
    },
    {
        id: "11",
        name: "Jennifer Watson",
        email: "jennifer_watson@gmail.com",
        image: images.user11
    }
];

export const selectedContacts = [
    {
        id: "1",
        name: "Abigail Vaniasiwa",
        email: "abigail_vaniasiwa@gmail.com",
        image: images.user1,
        amount: 100
    },
    {
        id: "2",
        name: "Adaline Gutenberg",
        email: "adaline_gutenberg@gmail.com",
        image: images.user2,
        amount: 100
    },
    {
        id: "3",
        name: "Alan Williamson",
        email: "alan_williamson@gmail.com",
        image: images.user3,
        amount: 100
    },
    {
        id: "4",
        name: "Albert Alenxander",
        email: "albert_alenxander@gmail.com",
        image: images.user4,
        amount: 100
    },
    {
        id: "5",
        name: "Alyssa Russel",
        email: "alyssa_russel@gmail.com",
        image: images.user5,
        amount: 100
    },
    {
        id: "6",
        name: "Anthony Robertson",
        email: "anthony_robertson@gmail.com",
        image: images.user6,
        amount: 100
    },
    {
        id: "7",
        name: "Arianna Cooper",
        email: "arianna_cooper@gmail.com",
        image: images.user7,
        amount: 100
    },
    {
        id: "8",
        name: "Arthur Watson",
        email: "arthur_watson@gmail.com",
        image: images.user8,
        amount: 100
    }
]

export const allFavouriteContacts = [
    {
        id: "1",
        name: "Anthony Robertson",
        email: "anthony_robertson@gmail.com",
        image: images.user6
    },
    {
        id: "2",
        name: "Arianna Cooper",
        email: "arianna_cooper@gmail.com",
        image: images.user7
    },
    {
        id: "3",
        name: "Arthur Watson",
        email: "arthur_watson@gmail.com",
        image: images.user8
    },
    {
        id: "4",
        name: "Aubrey Watson",
        email: "aubrey_watson@gmail.com",
        image: images.user9
    },
    {
        id: "5",
        name: "Jeannette Liliana",
        email: "jeannette_liliana@gmail.com",
        image: images.user10
    },
    {
        id: "6",
        name: "Jennifer Watson",
        email: "jennifer_watson@gmail.com",
        image: images.user11
    },
    {
        id: "7",
        name: "Abigail Vaniasiwa",
        email: "abigail_vaniasiwa@gmail.com",
        image: images.user1
    },
    {
        id: "8",
        name: "Adaline Gutenberg",
        email: "adaline_gutenberg@gmail.com",
        image: images.user2
    },
    {
        id: "9",
        name: "Alan Williamson",
        email: "alan_williamson@gmail.com",
        image: images.user3
    },
    {
        id: "10",
        name: "Albert Alenxander",
        email: "albert_alenxander@gmail.com",
        image: images.user4
    },
    {
        id: "11",
        name: "Alyssa Russel",
        email: "alyssa_russel@gmail.com",
        image: images.user5
    }
];

export const bankData = [
    {
        id: 1,
        icon: icons.bank,
        bankName: 'Bank of America',
        type: 'Checking',
        lastCardNumber: '1234',
    },
    {
        id: 2,
        icon: icons.masterCard,
        bankName: 'MasterCard',
        type: 'Checking',
        lastCardNumber: '5678',
    },
    {
        id: 3,
        icon: icons.visa,
        bankName: 'Visa',
        type: 'Checking',
        lastCardNumber: '9101',
    },
    {
        id: 4,
        icon: icons.masterCard,
        bankName: 'MasterCard',
        type: 'Discover',
        lastCardNumber: '1121',
    },
    {
        id: 5,
        icon: icons.bank,
        bankName: 'JPMorgan Chase Bank',
        type: 'Checking',
        lastCardNumber: '3141',
    }
];

export const services = [
    // Utility Bill Payments
    { id: '1', name: 'LUKU (Electricity)', icon: icons.electricity, iconColor: '#FFD300', backgroundColor: 'rgba(255, 211, 0, .12)', onPress: 'PayBillsLUKU' },
    { id: '2', name: 'DAWASA / ZAWA (Water)', icon: icons.water, iconColor: '#1A96F0', backgroundColor: 'rgba(26, 150, 240, .12)', onPress: 'PayBillsWater' },
    // Government Fees & Public Services
    { id: '3', name: 'TRA Payments', icon: icons.tax, iconColor: '#FF981F', backgroundColor: 'rgba(255, 152, 31, .12)', onPress: 'PayTRAPayments' },
    { id: '4', name: 'NIDA Fees', icon: icons.idCard, iconColor: '#673AB3', backgroundColor: 'rgba(103, 58, 179, .12)', onPress: 'PayNIDAFees' },
    { id: '5', name: 'Driving License', icon: icons.license, iconColor: '#3F51B2', backgroundColor: 'rgba(63, 81, 178, .12)', onPress: 'PayDrivingLicense' },
    { id: '6', name: 'Immigration Services', icon: icons.passport, iconColor: '#9D28AC', backgroundColor: 'rgba(157, 40, 172, .12)', onPress: 'PayImmigration' },
    { id: '7', name: 'Municipal Council Fees', icon: icons.municipal, iconColor: '#FF5726', backgroundColor: 'rgba(255, 87, 38, .12)', onPress: 'PayMunicipal' },
    { id: '8', name: 'NHIF', icon: icons.health, iconColor: '#8BC255', backgroundColor: 'rgba(139, 194, 85, .12)', onPress: 'PayNHIF' },
    // Education Payments
    { id: '9', name: 'NECTA', icon: icons.education, iconColor: '#00BCD3', backgroundColor: 'rgba(0, 188, 211, .12)', onPress: 'PayNECTA' },
    { id: '10', name: 'School & University Fees', icon: icons.school, iconColor: '#607D8A', backgroundColor: 'rgba(96, 125, 138, .12)', onPress: 'PaySchoolFees' },
    { id: '11', name: 'Student Loans Board (HESLB)', icon: icons.loan, iconColor: '#FFC02D', backgroundColor: 'rgba(255, 192, 45, .12)', onPress: 'PayHESLB' },
    // Transport & Travel
    { id: '12', name: 'Ferry Tickets', icon: icons.ferry, iconColor: '#EA1E61', backgroundColor: 'rgba(234, 30, 97, .12)', onPress: 'PayFerryTickets' },
    { id: '13', name: 'Flight Tickets', icon: icons.flight, iconColor: '#22D3EE', backgroundColor: 'rgba(34, 211, 238, .12)', onPress: 'PayFlightTickets' },
];

export const billServices = [
    { id: '1', name: 'LUKU', icon: icons.electricity, iconColor: '#FFD300', backgroundColor: 'rgba(255, 211, 0, .12)', onPress: 'PayBillsLUKU' },
    { id: '2', name: 'Water', icon: icons.water, iconColor: '#1A96F0', backgroundColor: 'rgba(26, 150, 240, .12)', onPress: 'PayBillsWater' },
    { id: '3', name: 'TRA', icon: icons.tax, iconColor: '#FF981F', backgroundColor: 'rgba(255, 152, 31, .12)', onPress: 'PayTRAPayments' },
    { id: '4', name: 'NIDA', icon: icons.idCard, iconColor: '#673AB3', backgroundColor: 'rgba(103, 58, 179, .12)', onPress: 'PayNIDAFees' },
    { id: '5', name: 'License', icon: icons.license, iconColor: '#3F51B2', backgroundColor: 'rgba(63, 81, 178, .12)', onPress: 'PayDrivingLicense' },
    { id: '6', name: 'Immigration', icon: icons.passport, iconColor: '#9D28AC', backgroundColor: 'rgba(157, 40, 172, .12)', onPress: 'PayImmigration' },
    { id: '7', name: 'Municipal', icon: icons.municipal, iconColor: '#FF5726', backgroundColor: 'rgba(255, 87, 38, .12)', onPress: 'PayMunicipal' },
    { id: '9', name: 'NECTA', icon: icons.education, iconColor: '#00BCD3', backgroundColor: 'rgba(0, 188, 211, .12)', onPress: 'PayNECTA' },
    { id: '10', name: 'School', icon: icons.school, iconColor: '#607D8A', backgroundColor: 'rgba(96, 125, 138, .12)', onPress: 'PaySchoolFees' },
    { id: '11', name: 'Loan', icon: icons.loan, iconColor: '#FFC02D', backgroundColor: 'rgba(255, 192, 45, .12)', onPress: 'PayHESLB' },
    { id: '12', name: 'Ferry', icon: icons.ferry, iconColor: '#EA1E61', backgroundColor: 'rgba(234, 30, 97, .12)', onPress: 'PayFerryTickets' },
    { id: '13', name: 'Flight', icon: icons.flight, iconColor: '#22D3EE', backgroundColor: 'rgba(34, 211, 238, .12)', onPress: 'PayFlightTickets' },
];

export const insuranceServices = [
    { id: '1', name: 'Health', icon: icons.health, iconColor: '#8BC255', backgroundColor: 'rgba(139, 194, 85, .12)', onPress: 'PayHealthInsurance' },
    { id: '2', name: 'Motor', icon: icons.motor, iconColor: '#7A5548', backgroundColor: 'rgba(122, 85, 72, .12)', onPress: 'PayMotorInsurance' },
    { id: '3', name: 'Life', icon: icons.life, iconColor: '#00BCD3', backgroundColor: 'rgba(0, 188, 211, .12)', onPress: 'PayLifeInsurance' },
    { id: '4', name: 'Travel', icon: icons.flight, iconColor: '#22D3EE', backgroundColor: 'rgba(34, 211, 238, .12)', onPress: 'PayTravelInsurance' },
    { id: '5', name: 'Property', icon: icons.property, iconColor: '#FFC02D', backgroundColor: 'rgba(255, 192, 45, .12)', onPress: 'PayPropertyInsurance' },
];

export const optionServices = [
    // Optionally add more, or leave empty for now
]
export const allActivities = [
    {
        id: "1",
        name: "Marvin McKinney",
        type: "Preapproved Payment",
        status: "Completed",
        date: "24 December, 2024",
        amount: "+ $348.50"
    },
    {
        id: "2",
        name: "Christian Dawson",
        type: "Send Money",
        status: "Completed",
        date: "24 December, 2024",
        amount: "- $225.00"
    },
    {
        id: "3",
        name: "Abigail Vaniasiwa",
        type: "Payment Request",
        status: "Pending",
        date: "23 December, 2024",
        amount: "- $1,000.00"
    },
    {
        id: "4",
        name: "Invoice #0259 - Michael",
        type: "Invoice",
        status: "Unpaid",
        date: "23 December, 2024",
        amount: "$150.00"
    },
    {
        id: "5",
        name: "Water Bill",
        type: "Bills",
        status: "Completed",
        date: "22 December, 2024",
        amount: "- $79.64"
    },
    {
        id: "6",
        name: "Leslie Alexander",
        type: "Preapproved Payment",
        status: "Completed",
        date: "22 December, 2024",
        amount: "+ $129.5"
    },
    {
        id: "7",
        name: "Savannah Nguyen",
        type: "Send Money",
        status: "Completed",
        date: "22 December, 2024",
        amount: "- $46.75"
    },
    {
        id: "8",
        name: "Marvin McKinney",
        type: "Preapproved Payment",
        status: "Completed",
        date: "22 December, 2024",
        amount: "+ $348.50"
    }
];


export const activitiesReceived = [
    {
        id: "1",
        name: "Leslie Alexander",
        amount: "+ $129.5",
        type: "Preapproved Payment",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "2",
        name: "Cameron Williamson",
        amount: "+ $86.26",
        type: "Preapproved Payment",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "3",
        name: "Brooklyn Simmons",
        amount: "+ $230.12",
        type: "Direct Deposit",
        status: "Pending",
        transactionType: "Credit"
    },
    {
        id: "4",
        name: "Courtney Henry",
        amount: "+ $75.5",
        type: "Cash Deposit",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "5",
        name: "Wade Warren",
        amount: "+ $120.00",
        type: "Refund",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "6",
        name: "Jenny Wilson",
        amount: "+ $50.00",
        type: "Cashback Reward",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "7",
        name: "Jenny Wilson",
        amount: "+ $50.00",
        type: "Cashback Reward",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "7",
        name: "Lucien Jack",
        amount: "+ $59.5",
        type: "Cash Deposit",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "8",
        name: "Marvin McKinney",
        amount: "+ $123.90",
        type: "Preapproved Payment",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "9",
        name: "Leslie Alexander",
        amount: "+ $1000",
        type: "Cash Deposit",
        status: "Completed",
        transactionType: "Credit"
    },
    {
        id: "10",
        name: "Courtney Henry",
        amount: "+ $1200",
        type: "Payment",
        status: "Pending",
        transactionType: "Credit"
    }
];

export const activitiesSent = [
    {
        id: "1",
        name: "Savannah Nguyen",
        amount: "- $46.75",
        type: "Transfer Bank",
        status: "Completed",
        transactionType: "Debit"
    },
    {
        id: "2",
        name: "Ralph Edwards",
        amount: "- $150.00",
        type: "Online Purchase",
        status: "Completed",
        transactionType: "Debit"
    },
    {
        id: "3",
        name: "Kathryn Murphy",
        amount: "- $300.00",
        type: "Bill Payment",
        status: "Completed",
        transactionType: "Debit"
    },
    {
        id: "4",
        name: "Esther Howard",
        amount: "- $22.95",
        type: "Transfer Bank",
        status: "Pending",
        transactionType: "Debit"
    },
    {
        id: "5",
        name: "Esther Howard",
        amount: "- $24.95",
        type: "Transfer Bank",
        status: "Pending",
        transactionType: "Debit"
    },
    {
        id: "6",
        name: "Ana Jacqueline",
        amount: "- $300.00",
        type: "Online Purchase",
        status: "Completed",
        transactionType: "Debit"
    },
    {
        id: "7",
        name: "Bank of America",
        amount: "- $300.00",
        type: "Bank Transfer",
        status: "Completed",
        transactionType: "Debit"
    },
    {
        id: "8",
        name: "Water Bill",
        amount: "- $79.64",
        type: "Bills",
        status: "Completed",
        transactionType: "Debit"
    },
    {
        id: "9",
        name: "Savannah Nguyen",
        amount: "- $119.64",
        type: "Send Money",
        status: "Completed",
        transactionType: "Debit"
    },
    {
        id: "10",
        name: "Theresa Webb",
        amount: "- $500.00",
        type: "Send Money",
        status: "Pending",
        transactionType: "Debit"
    }
];

export const allInvoicing = [
    {
        id: "1",
        number: "0258",
        username: "Jenny",
        status: "Unpaid",
        date: "21 Dec, 2024",
        amount: "$150.00"
    },
    {
        id: "2",
        number: "0259",
        username: "Michael",
        status: "Paid",
        date: "23 Dec, 2024",
        amount: "$250.00"
    },
    {
        id: "3",
        number: "0260",
        username: "Leslie",
        status: "Draft",
        date: "23 Dec, 2024",
        amount: "$300.00"
    },
    {
        id: "4",
        number: "0261",
        username: "Savannah",
        status: "Unpaid",
        date: "22 Dec, 2024",
        amount: "$475.00"
    },
    {
        id: "5",
        number: "0263",
        username: "Thomas",
        status: "Paid",
        date: "22 Dec, 2024",
        amount: "$900.00"
    },
    {
        id: "6",
        number: "0264",
        username: "Vania",
        status: "Unpaid",
        date: "21 Dec, 2024",
        amount: "$340.00"
    },
    {
        id: "7",
        number: "0265",
        username: "Abigail",
        status: "Paid",
        date: "21 Dec, 2024",
        amount: "$155.00"
    },
    {
        id: "8",
        number: "0265",
        username: "John",
        status: "Paid",
        date: "21 Dec, 2024",
        amount: "$125.00"
    },
    {
        id: "9",
        number: "0266",
        username: "Jean",
        status: "Unpaid",
        date: "21 Dec, 2024",
        amount: "$150.00"
    },
    {
        id: "10",
        number: "0267",
        username: "Lucas",
        status: "Draft",
        date: "20 Dec, 2024",
        amount: "$45.60"
    },
    {
        id: "11",
        number: "0268",
        username: "Liliana",
        status: "Unpaid",
        date: "20 Dec, 2024",
        amount: "$970.00"
    },
    {
        id: "12",
        number: "0269",
        username: "Billy",
        status: "Paid",
        date: "19 Dec, 2024",
        amount: "$150.00"
    },
    {
        id: "13",
        number: "0270",
        username: "Geoffrey",
        status: "Draft",
        date: "19 Dec, 2024",
        amount: "$452.00"
    }
]

export const draftInvoicing = [
    {
        id: "1",
        number: "0258",
        username: "Jenny",
        status: "Draft",
        date: "21 Dec, 2024",
        amount: "$150.00"
    },
    {
        id: "2",
        number: "0259",
        username: "Michael",
        status: "Draft",
        date: "23 Dec, 2024",
        amount: "$250.00"
    },
    {
        id: "3",
        number: "0260",
        username: "Leslie",
        status: "Draft",
        date: "23 Dec, 2024",
        amount: "$300.00"
    },
    {
        id: "4",
        number: "0261",
        username: "Savannah",
        status: "Draft",
        date: "22 Dec, 2024",
        amount: "$475.00"
    },
    {
        id: "5",
        number: "0263",
        username: "Thomas",
        status: "Draft",
        date: "22 Dec, 2024",
        amount: "$900.00"
    },
    {
        id: "6",
        number: "0264",
        username: "Vania",
        status: "Draft",
        date: "21 Dec, 2024",
        amount: "$340.00"
    },
    {
        id: "7",
        number: "0265",
        username: "Abigail",
        status: "Draft",
        date: "21 Dec, 2024",
        amount: "$155.00"
    },
    {
        id: "8",
        number: "0265",
        username: "John",
        status: "Draft",
        date: "21 Dec, 2024",
        amount: "$125.00"
    },
    {
        id: "9",
        number: "0266",
        username: "Jean",
        status: "Draft",
        date: "21 Dec, 2024",
        amount: "$150.00"
    },
    {
        id: "10",
        number: "0267",
        username: "Lucas",
        status: "Draft",
        date: "20 Dec, 2024",
        amount: "$45.60"
    },
    {
        id: "11",
        number: "0268",
        username: "Liliana",
        status: "Draft",
        date: "20 Dec, 2024",
        amount: "$970.00"
    },
    {
        id: "12",
        number: "0269",
        username: "Billy",
        status: "Draft",
        date: "19 Dec, 2024",
        amount: "$150.00"
    },
    {
        id: "13",
        number: "0270",
        username: "Geoffrey",
        status: "Draft",
        date: "19 Dec, 2024",
        amount: "$452.00"
    }
];

export const paidInvoicing = [
    {
        id: "1",
        number: "0258",
        username: "Jenny",
        status: "Paid",
        date: "21 Dec, 2024",
        amount: "$245.00"
    },
    {
        id: "2",
        number: "0259",
        username: "Michael",
        status: "Paid",
        date: "23 Dec, 2024",
        amount: "$20.00"
    },
    {
        id: "3",
        number: "0260",
        username: "Leslie",
        status: "Paid",
        date: "23 Dec, 2024",
        amount: "$300.00"
    },
    {
        id: "4",
        number: "0261",
        username: "Savannah",
        status: "Paid",
        date: "22 Dec, 2024",
        amount: "$425.00"
    },
    {
        id: "5",
        number: "0263",
        username: "Thomas",
        status: "Paid",
        date: "22 Dec, 2024",
        amount: "$900.00"
    },
    {
        id: "6",
        number: "0264",
        username: "Vania",
        status: "Paid",
        date: "21 Dec, 2024",
        amount: "$390.00"
    },
    {
        id: "7",
        number: "0265",
        username: "Abigail",
        status: "Paid",
        date: "21 Dec, 2024",
        amount: "$155.00"
    },
    {
        id: "13",
        number: "0265",
        username: "John",
        status: "Paid",
        date: "21 Dec, 2024",
        amount: "$125.00"
    },
    {
        id: "8",
        number: "0266",
        username: "Jean",
        status: "Paid",
        date: "21 Dec, 2024",
        amount: "$140.00"
    },
    {
        id: "9",
        number: "0267",
        username: "Lucas",
        status: "Paid",
        date: "20 Dec, 2024",
        amount: "$45.60"
    },
    {
        id: "10",
        number: "0268",
        username: "Liliana",
        status: "Paid",
        date: "20 Dec, 2024",
        amount: "$970.00"
    },
    {
        id: "11",
        number: "0269",
        username: "Billy",
        status: "Paid",
        date: "19 Dec, 2024",
        amount: "$150.00"
    },
    {
        id: "12",
        number: "0270",
        username: "Geoffrey",
        status: "Paid",
        date: "19 Dec, 2024",
        amount: "$452.00"
    }
]

export const unpaidInvoicing = [
    {
        id: "1",
        number: "0258",
        username: "Jenny",
        status: "Unpaid",
        date: "21 Dec, 2024",
        amount: "$150.00"
    },
    {
        id: "2",
        number: "0259",
        username: "Michael",
        status: "Unpaid",
        date: "23 Dec, 2024",
        amount: "$250.00"
    },
    {
        id: "3",
        number: "0260",
        username: "Leslie",
        status: "Unpaid",
        date: "23 Dec, 2024",
        amount: "$300.00"
    },
    {
        id: "4",
        number: "0261",
        username: "Savannah",
        status: "Unpaid",
        date: "22 Dec, 2024",
        amount: "$475.00"
    },
    {
        id: "5",
        number: "0263",
        username: "Thomas",
        status: "Unpaid",
        date: "22 Dec, 2024",
        amount: "$900.00"
    },
    {
        id: "6",
        number: "0264",
        username: "Vania",
        status: "Unpaid",
        date: "21 Dec, 2024",
        amount: "$340.00"
    },
    {
        id: "7",
        number: "0265",
        username: "Abigail",
        status: "Unpaid",
        date: "21 Dec, 2024",
        amount: "$155.00"
    },
    {
        id: "13",
        number: "0265",
        username: "John",
        status: "Unpaid",
        date: "21 Dec, 2024",
        amount: "$125.00"
    },
    {
        id: "8",
        number: "0266",
        username: "Jean",
        status: "Unpaid",
        date: "21 Dec, 2024",
        amount: "$150.00"
    },
    {
        id: "9",
        number: "0267",
        username: "Lucas",
        status: "Unpaid",
        date: "20 Dec, 2024",
        amount: "$45.60"
    },
    {
        id: "10",
        number: "0268",
        username: "Liliana",
        status: "Unpaid",
        date: "20 Dec, 2024",
        amount: "$970.00"
    },
    {
        id: "11",
        number: "0269",
        username: "Billy",
        status: "Unpaid",
        date: "19 Dec, 2024",
        amount: "$150.00"
    },
    {
        id: "12",
        number: "0270",
        username: "Geoffrey",
        status: "Unpaid",
        date: "19 Dec, 2024",
        amount: "$452.00"
    }
]

export const invoiceItems = [
    {
        id: "1",
        name: "Audio & Soundtrack",
        amount: 35.00
    },
    {
        id: "2",
        name: "Digital UI/UX Ebooks",
        amount: 27.75
    },
    {
        id: "3",
        name: "Stock Photography",
        amount: 24.00
    },
    {
        id: "4",
        name: "Graphic Design",
        amount: 32.00
    },
    {
        id: "5",
        name: "Graphic Elements",
        amount: 37.75
    },
    {
        id: "6",
        name: "Online Course Video",
        amount: 40.00
    },
    {
        id: "7",
        name: "Presentation Templates",
        amount: 25.00
    },
    {
        id: "8",
        name: "Procreate Digital Art",
        amount: 29.00
    },
    {
        id: "9",
        name: "Software Development",
        amount: 45.50
    },
    {
        id: "10",
        name: "Stock Music & Video",
        amount: 32.00
    },
    {
        id: "11",
        name: "Web Design",
        amount: 35.00
    },
    {
        id: "12",
        name: "Web Development",
        amount: 34.00
    },
    {
        id: "13",
        name: "SEO Services",
        amount: 28.00
    },
    {
        id: "14",
        name: "Content Writing",
        amount: 22.50
    },
    {
        id: "15",
        name: "Social Media Marketing",
        amount: 30.00
    },
    {
        id: "16",
        name: "Email Marketing",
        amount: 26.00
    },
    {
        id: "17",
        name: "Video Editing",
        amount: 38.00
    },
    {
        id: "18",
        name: "Photography Editing",
        amount: 31.50
    },
    {
        id: "19",
        name: "Animation Services",
        amount: 50.00
    },
    {
        id: "20",
        name: "Illustration Services",
        amount: 27.00
    }
];

export const invoiceTaxes = [
    {
        id: "1",
        name: "Australia",
        rate: 10
    },
    {
        id: "2",
        name: "Canada",
        rate: 5
    },
    {
        id: "3",
        name: "United Kingdom",
        rate: 20
    },
    {
        id: "4",
        name: "Germany",
        rate: 19
    },
    {
        id: "5",
        name: "France",
        rate: 20
    },
    {
        id: "6",
        name: "Italy",
        rate: 22
    },
    {
        id: "7",
        name: "Spain",
        rate: 21
    },
    {
        id: "8",
        name: "Japan",
        rate: 10
    },
    {
        id: "9",
        name: "India",
        rate: 18
    },
    {
        id: "10",
        name: "China",
        rate: 13
    },
    {
        id: "11",
        name: "South Africa",
        rate: 15
    },
    {
        id: "12",
        name: "Brazil",
        rate: 17
    },
    {
        id: "13",
        name: "Mexico",
        rate: 16
    },
    {
        id: "14",
        name: "Russia",
        rate: 20
    },
    {
        id: "15",
        name: "Netherlands",
        rate: 21
    },
    {
        id: "16",
        name: "Sweden",
        rate: 25
    },
    {
        id: "17",
        name: "Switzerland",
        rate: 7.7
    },
    {
        id: "18",
        name: "New Zealand",
        rate: 15
    },
    {
        id: "19",
        name: "Singapore",
        rate: 7
    },
    {
        id: "20",
        name: "South Korea",
        rate: 10
    }
];

export const allCustomers = [
    {
        id: "1",
        name: "Abigail Vaniasiwa",
        email: "abigail_vaniasiwa@gmail.com",
        image: images.user1
    },
    {
        id: "2",
        name: "Adaline Gutenberg",
        email: "adaline_gutenberg@gmail.com",
        image: images.user2
    },
    {
        id: "3",
        name: "Alan Williamson",
        email: "alan_williamson@gmail.com",
        image: images.user3
    },
    {
        id: "4",
        name: "Albert Alenxander",
        email: "albert_alenxander@gmail.com",
        image: images.user4
    },
    {
        id: "5",
        name: "Alyssa Russel",
        email: "alyssa_russel@gmail.com",
        image: images.user5
    },
    {
        id: "6",
        name: "Anthony Robertson",
        email: "anthony_robertson@gmail.com",
        image: images.user6
    },
    {
        id: "7",
        name: "Arianna Cooper",
        email: "arianna_cooper@gmail.com",
        image: images.user7
    },
    {
        id: "8",
        name: "Arthur Watson",
        email: "arthur_watson@gmail.com",
        image: images.user8
    },
    {
        id: "9",
        name: "Aubrey Watson",
        email: "aubrey_watson@gmail.com",
        image: images.user9
    },
    {
        id: "10",
        name: "Jeannette Liliana",
        email: "jeannette_liliana@gmail.com",
        image: images.user10
    },
    {
        id: "11",
        name: "Jennifer Watson",
        email: "jennifer_watson@gmail.com",
        image: images.user11
    }
];

export const selectedCustomers = [
    {
        id: "1",
        name: "Abigail Vaniasiwa",
        email: "abigail_vaniasiwa@gmail.com",
        image: images.user1,
        amount: 100
    },
    {
        id: "2",
        name: "Adaline Gutenberg",
        email: "adaline_gutenberg@gmail.com",
        image: images.user2,
        amount: 100
    },
    {
        id: "3",
        name: "Alan Williamson",
        email: "alan_williamson@gmail.com",
        image: images.user3,
        amount: 100
    },
    {
        id: "4",
        name: "Albert Alenxander",
        email: "albert_alenxander@gmail.com",
        image: images.user4,
        amount: 100
    },
    {
        id: "5",
        name: "Alyssa Russel",
        email: "alyssa_russel@gmail.com",
        image: images.user5,
        amount: 100
    },
    {
        id: "6",
        name: "Anthony Robertson",
        email: "anthony_robertson@gmail.com",
        image: images.user6,
        amount: 100
    },
    {
        id: "7",
        name: "Arianna Cooper",
        email: "arianna_cooper@gmail.com",
        image: images.user7,
        amount: 100
    },
    {
        id: "8",
        name: "Arthur Watson",
        email: "arthur_watson@gmail.com",
        image: images.user8,
        amount: 100
    }
]

export const allFavouriteCustomers = [
    {
        id: "1",
        name: "Anthony Robertson",
        email: "anthony_robertson@gmail.com",
        image: images.user6
    },
    {
        id: "2",
        name: "Arianna Cooper",
        email: "arianna_cooper@gmail.com",
        image: images.user7
    },
    {
        id: "3",
        name: "Arthur Watson",
        email: "arthur_watson@gmail.com",
        image: images.user8
    },
    {
        id: "4",
        name: "Aubrey Watson",
        email: "aubrey_watson@gmail.com",
        image: images.user9
    },
    {
        id: "5",
        name: "Jeannette Liliana",
        email: "jeannette_liliana@gmail.com",
        image: images.user10
    },
    {
        id: "6",
        name: "Jennifer Watson",
        email: "jennifer_watson@gmail.com",
        image: images.user11
    },
    {
        id: "7",
        name: "Abigail Vaniasiwa",
        email: "abigail_vaniasiwa@gmail.com",
        image: images.user1
    },
    {
        id: "8",
        name: "Adaline Gutenberg",
        email: "adaline_gutenberg@gmail.com",
        image: images.user2
    },
    {
        id: "9",
        name: "Alan Williamson",
        email: "alan_williamson@gmail.com",
        image: images.user3
    },
    {
        id: "10",
        name: "Albert Alenxander",
        email: "albert_alenxander@gmail.com",
        image: images.user4
    },
    {
        id: "11",
        name: "Alyssa Russel",
        email: "alyssa_russel@gmail.com",
        image: images.user5
    }
];

export const bankDataCard = [
    {
        id: 1,
        icon: icons.bank,
        bankName: 'Bank of America',
        type: 'Checking',
        lastCardNumber: '1234',
    },
    {
        id: 2,
        icon: icons.masterCard,
        bankName: 'MasterCard',
        type: 'Checking',
        lastCardNumber: '5678',
    },
    {
        id: 3,
        icon: icons.visa,
        bankName: 'Visa',
        type: 'Checking',
        lastCardNumber: '9101',
    },
    {
        id: 4,
        icon: icons.masterCard,
        bankName: 'MasterCard',
        type: 'Discover',
        lastCardNumber: '1121',
    },
    {
        id: 5,
        icon: icons.bank,
        bankName: 'JPMorgan Chase Bank',
        type: 'Checking',
        lastCardNumber: '3141',
    },
    {
        id: 6,
        icon: icons.masterCard,
        bankName: 'MasterCard',
        type: 'Checking',
        lastCardNumber: '3213',
    },
    {
        id: 7,
        icon: icons.bank,
        bankName: 'Wise Bank',
        type: 'Checking',
        lastCardNumber: '1278',
    },
    {
        id: 8,
        icon: icons.visa,
        bankName: 'Visa',
        type: 'Checking',
        lastCardNumber: '1083',
    },
];

export const automaticPaymentsData = [
    {
        id: "1",
        name: "Gumroad Inc",
        icon: socials.gumroad
    },
    {
        id: "2",
        name: "Freepik Company",
        icon: socials.freepik
    },
    {
        id: "3",
        name: "Upwork Inc",
        icon: socials.upwork
    },
    {
        id: "4",
        name: "Fiverr Company",
        icon: socials.fiverr
    },
    {
        id: "5",
        name: "Walmart Marketplace",
        icon: socials.walmart
    },
    {
        id: "6",
        name: "Envato Market",
        icon: socials.envato
    },
    {
        id: "7",
        name: "Amazon E-commerce",
        icon: socials.amazon
    },
    {
        id: "8",
        name: "Shopify Marketplace",
        icon: socials.shopify
    }
];

export const activeSubscriptions = [
    {
        id: "1",
        icon: socials.iqiyi,
        name: "IQIYI Premium",
        durationInMonths: 12,
        expireDate: "Dec 30, 2025",
    },
    {
        id: "2",
        icon: socials.netflix,
        name: "Netflix Streaming",
        durationInMonths: 22,
        expireDate: "Dec 12, 2027",
    },
    {
        id: "3",
        icon: socials.telegram,
        name: "Telegram Premium",
        durationInMonths: 6,
        expireDate: "June 22, 2025",
    }
];

export const expiredSubscriptions = [
    {
        id: "1",
        icon: socials.pikpak,
        name: "Pikpak Cloud Server",
        durationInMonths: 12,
        expireDate: "Dec 30, 2024",
    },
    {
        id: "2",
        icon: socials.discord,
        name: "Discord Nitro",
        durationInMonths: 12,
        expireDate: "Jan 12, 2025",
    },
    {
        id: "3",
        icon: socials.zoom,
        name: "Zoom Video Meetings",
        durationInMonths: 8,
        expireDate: "11 Feb, 2024",
    }
];

export const faqKeywords = [
    {
        id: "1",
        name: "General"
    },
    {
        id: "2",
        name: "Account"
    },
    {
        id: "3",
        name: "Security"
    },
    {
        id: "4",
        name: "Transactions"
    },
    {
        id: "5",
        name: "Loans"
    },
    {
        id: "6",
        name: "Payments"
    }
];

export const faqs = [
    {
        question: 'How do I open a new bank account?',
        answer: 'To open a new bank account, log in to the app, go to the "Accounts" section, and follow the prompts to open a new account. You will need to provide some personal information and identification documents.',
        type: "Account"
    },
    {
        question: 'How can I reset my online banking password?',
        answer: 'To reset your online banking password, go to the login screen and click on "Forgot Password". Follow the instructions to reset your password. You may need to verify your identity using your registered email or phone number.',
        type: "Security"
    },
    {
        question: 'What should I do if I notice an unauthorized transaction?',
        answer: 'If you notice an unauthorized transaction, immediately contact customer support through the app. You can also lock your card through the "Card Management" section to prevent further unauthorized transactions.',
        type: "Transactions"
    },
    {
        question: 'How do I apply for a loan?',
        answer: 'To apply for a loan, go to the "Loans" section of the app, choose the type of loan you are interested in, and complete the application form. You will need to provide details about your income, employment, and the amount you wish to borrow.',
        type: "Loans"
    },
    {
        question: 'Can I make payments through the app?',
        answer: 'Yes, you can make various payments through the app including bill payments, transfers to other bank accounts, and payments to merchants. Go to the "Payments" section and follow the instructions.',
        type: "Payments"
    },
    {
        question: 'How do I update my contact information?',
        answer: "To update your contact information, go to your account settings, and you will find options to edit your profile details such as your address, phone number, and email.",
        type: "Account"
    },
    {
        question: 'How secure is my information in the app?',
        answer: 'We prioritize the security of your information. Our app uses advanced encryption and security protocols to ensure that your personal and financial data is protected.',
        type: "Security"
    },
    {
        question: 'How can I view my transaction history?',
        answer: 'To view your transaction history, go to the "Transactions" section of the app. You can filter transactions by date, type, and amount.',
        type: "Transactions"
    },
    {
        question: 'What types of accounts can I open?',
        answer: 'You can open various types of accounts including savings accounts, checking accounts, and fixed deposit accounts. Visit the "Accounts" section of the app for more details and to open a new account.',
        type: "Account"
    },
    {
        question: 'How can I contact customer support?',
        answer: 'To contact customer support, go to the "Help" section in the app. You can reach us via chat, email, or phone. Our support team is available 24/7 to assist you.',
        type: "General"
    },
];

export const friends = [
    {
        id: "1",
        name: "Tynisa Obey",
        phoneNumber: "+1-300-400-0135",
        avatar: images.user1,
    },
    {
        id: "2",
        name: "Florencio Dorance",
        phoneNumber: "+1-309-900-0135",
        avatar: images.user2,
    },
    {
        id: "3",
        name: "Chantal Shelburne",
        phoneNumber: "+1-400-100-1009",
        avatar: images.user3,
    },
    {
        id: "4",
        name: "Maryland Winkles",
        phoneNumber: "+1-970-200-4550",
        avatar: images.user4,
    },
    {
        id: "5",
        name: "Rodolfo Goode",
        phoneNumber: "+1-100-200-9800",
        avatar: images.user5,
    },
    {
        id: "6",
        name: "Benny Spanbauer",
        phoneNumber: "+1-780-200-9800",
        avatar: images.user6,
    },
    {
        id: "7",
        name: "Tyra Dillon",
        phoneNumber: "+1-943-230-9899",
        avatar: images.user7,
    },
    {
        id: "8",
        name: "Jamel Eusobio",
        phoneNumber: "+1-900-234-9899",
        avatar: images.user8,
    },
    {
        id: "9",
        name: "Pedro Haurad",
        phoneNumber: "+1-240-234-9899",
        avatar: images.user9
    },
    {
        id: "10",
        name: "Clinton Mcclure",
        phoneNumber: "+1-500-234-4555",
        avatar: images.user10
    },
];

export const userAddresses = [
    {
        id: "1",
        name: "Home",
        address: "364 Stillwater Ave, Attleboro, MA 02703",
    },
    {
        id: "2",
        name: "Office",
        address: "73 Virginia Rd, Cuyahoga Falls, OH 44221",
    },
    {
        id: "3",
        name: "Mall Plaza",
        address: "123 Main St, San Francisco, CA 94107",
    },
    {
        id: "4",
        name: "Garden Park",
        address: "600 Bloom St, Portland, OR 97201",
    },
    {
        id: "5",
        name: "Grand City Park",
        address: "26 State St Daphne, AL 36526"
    },
    {
        id: "6",
        name: "Town Square",
        address: "20 Applegate St. Hoboken, NJ 07030"
    },
    {
        id: "7",
        name: "Bank",
        address: "917 W Pine Street Easton, PA 0423"
    }
];

export const banners = [
    {
        id: "1",
        discount: '40%',
        discountName: "Today's Special",
        bottomTitle: 'Get a discount for every transaction!',
        bottomSubtitle: 'Only valid for today!',
        primaryColor: "rgba(94,146,254,255)",
        secondaryColor: "rgba(62,125,254,255)"
    },
    {
        id: "2",
        discount: '50%',
        discountName: "Weekend Sale",
        bottomTitle: 'Special discount for weekend orderings!',
        bottomSubtitle: 'This weekend only!',
        primaryColor: "rgba(255,123,127,255)",
        secondaryColor: "rgba(254,96,102,255)"
    },
    {
        id: "3",
        discount: '30%',
        discountName: "Limited Time Offer",
        bottomTitle: 'Hurry up! Limited time offer!',
        bottomSubtitle: 'Get disount on every purchase with a minimum spend of $120!',
        primaryColor: "rgba(123,89,254,255)",
        secondaryColor: "rgba(110,72,254,255)"
    },
    {
        id: "4",
        discount: '35%',
        discountName: "Limited Time Offer",
        bottomTitle: 'Hurry up! Limited time offer!',
        bottomSubtitle: 'Get discount every topup, transfer and payment!',
        primaryColor: "rgba(49,214,119,255)",
        secondaryColor: "rgba(35,195,102,255)"
    },
    {
        id: "5",
        discount: '35%',
        discountName: "Today's Special",
        bottomTitle: 'Get a discount for every transaction!',
        bottomSubtitle: 'Only valid for today!',
        primaryColor: "rgba(94,146,254,255)",
        secondaryColor: "rgba(62,125,254,255)"
    },
];

export const inOutPaymentHistory = [
    {
        id: "1",
        name: "McDonald's Orders",
        image: icons.mcdonalds,
        date: "Dec 24, 2024",
        time: "14:26:34 PM",
        price: "$25",
        type: "Expense"
    },
    {
        id: "2",
        name: "AirBnB Royalty",
        image: icons.airbnb,
        date: "Dec 24, 2024",
        time: "09:37:24 PM",
        price: "$1225",
        type: "Income"
    },
    {
        id: "3",
        name: "Darron Kulikwiski",
        image: images.user4,
        date: "Dec 24, 2024",
        time: "08:11:02 PM",
        price: "$250",
        type: "Income"
    },
    {
        id: "4",
        name: "Netflix Subscription",
        image: icons.netflix,
        date: "Dec 23, 2024",
        time: "16:35:47 PM",
        price: "$32",
        type: "Expense"
    },
    {
        id: "5",
        name: "Hannah Burress",
        image: images.user5,
        date: "Dec 23, 2024",
        time: "11:43:56 PM",
        price: "$25",
        type: "Income"
    },
    {
        id: "6",
        name: "Aillen Fullbright",
        image: images.user7,
        date: "Dec 22, 2024",
        time: "15:43:29 PM",
        price: "$80",
        type: "Expense"
    },
    {
        id: "7",
        name: "Ali Sankos",
        image: images.user8,
        date: "Dec 22, 2024",
        time: "14:26:34 PM",
        price: "$2500",
        type: "Income"
    },
    {
        id: "8",
        name: "Juliana Scott",
        image: images.user9,
        date: "Dec 21, 2024",
        time: "10:20:14 PM",
        price: "$400",
        type: "Income"
    },
    {
        id: "9",
        name: "Liliana Jacqueline",
        image: images.user10,
        date: "Dec 21, 2024",
        time: "17:09:22 PM",
        price: "$324",
        type: "Expense"
    },
    {
        id: "10",
        name: "Jean Lucas",
        image: images.user9,
        date: "Dec 21, 2024",
        time: "17:09:22 PM",
        price: "$1000",
        type: "Income"
    }
];

export const inOutPaymentScheduled = [
    {
        id: "1",
        name: "Augustina Midgett",
        image: images.user1,
        date: "Dec 21, 2024",
        time: "14:26:34 PM",
        price: "$125",
        type: "Expense",
        status: "Scheduled"
    },
    {
        id: "2",
        name: "Alfonzo Schuessler",
        image: images.user2,
        date: "Dec 20, 2024",
        time: "10:29:43 PM",
        price: "$90",
        type: "Expense",
        status: "Scheduled"
    },
    {
        id: "3",
        name: "Willard Purnell",
        image: images.user3,
        date: "Dec 19, 2024",
        time: "18:32:20 PM",
        price: "$99",
        type: "Expense",
        status: "Completed"
    },
    {
        id: "4",
        name: "Twyla Klingler",
        image: images.user4,
        date: "Dec 18, 2024",
        time: "09:45:12 AM",
        price: "$150",
        type: "Expense",
        status: "Scheduled"
    },
    {
        id: "5",
        name: "Shawnda Towne",
        image: images.user5,
        date: "Dec 17, 2024",
        time: "17:22:49 PM",
        price: "$200",
        type: "Expense",
        status: "Completed"
    },
    {
        id: "6",
        name: "Morton Dufour",
        image: images.user6,
        date: "Dec 16, 2024",
        time: "13:14:33 PM",
        price: "$75",
        type: "Expense",
        status: "Scheduled"
    },
    {
        id: "7",
        name: "Gertie Wurtz",
        image: images.user7,
        date: "Dec 15, 2024",
        time: "11:05:18 AM",
        price: "$110",
        type: "Expense",
        status: "Scheduled"
    },
    {
        id: "8",
        name: "Delmar Lockett",
        image: images.user8,
        date: "Dec 14, 2024",
        time: "20:37:25 PM",
        price: "$50",
        type: "Expense",
        status: "Completed"
    },
    {
        id: "9",
        name: "Nevada Reavis",
        image: images.user9,
        date: "Dec 13, 2024",
        time: "16:55:41 PM",
        price: "$180",
        type: "Expense",
        status: "Scheduled"
    }
];

export const inOutPaymentRequested = [
    {
        id: "1",
        name: "Justina Lear",
        image: images.user10,
        date: "Dec 12, 2024",
        time: "09:30:15 AM",
        price: "$85",
        type: "Income",
        status: "Requested"
    },
    {
        id: "2",
        name: "Vito Luciano",
        image: images.user11,
        date: "Dec 11, 2024",
        time: "11:45:22 AM",
        price: "$130",
        type: "Income",
        status: "Requested"
    },
    {
        id: "3",
        name: "Lue Mangold",
        image: images.user1,
        date: "Dec 10, 2024",
        time: "14:50:35 PM",
        price: "$45",
        type: "Income",
        status: "Requested"
    },
    {
        id: "4",
        name: "Lorrine Rogalski",
        image: images.user3,
        date: "Dec 09, 2024",
        time: "16:55:18 PM",
        price: "$200",
        type: "Income",
        status: "Completed"
    },
    {
        id: "5",
        name: "Drew Pyne",
        image: images.user4,
        date: "Dec 08, 2024",
        time: "10:20:11 AM",
        price: "$70",
        type: "Income",
        status: "Completed"
    },
    {
        id: "6",
        name: "Jodie Minter",
        image: images.user5,
        date: "Dec 07, 2024",
        time: "13:15:49 PM",
        price: "$115",
        type: "Income",
        status: "Completed"
    },
    {
        id: "7",
        name: "Clair Marenco",
        image: images.user6,
        date: "Dec 06, 2024",
        time: "15:35:27 PM",
        price: "$95",
        type: "Expense",
        status: "Completed"
    },
    {
        id: "8",
        name: "Devin Sarr",
        image: images.user7,
        date: "Dec 05, 2024",
        time: "08:45:10 AM",
        price: "$60",
        type: "Income",
        status: "Completed"
    },
    {
        id: "9",
        name: "Burtie Vargo",
        image: images.user8,
        date: "Dec 04, 2024",
        time: "17:50:45 PM",
        price: "$140",
        type: "Income",
        status: "Completed"
    }
];

export const userCards = [
    {
        id: "1",
        number: "2298 1268 3398 9874",
        balance: "28885.00",
        date: "12/24"
    },
    {
        id: "2",
        number: "4222 1268 3398 9874",
        balance: "12985.00",
        date: "09/26"
    },
    {
        id: "3",
        number: "4242 4242 3398 9874",
        balance: "120003.00",
        date: "12/25"
    },
    {
        id: "4",
        number: "4141 4242 3398 9874",
        balance: "100000.00",
        date: "12/25"
    },
    {
        id: "4",
        number: "4242 4242 3398 9874",
        balance: "1230015.25",
        date: "11/25"
    },
];

export const transactions = [
    {
        id: "1",
        name: "McDonald's Orders",
        image: icons.mcdonalds,
        date: "Dec 24, 2024",
        time: "14:26:34 PM",
        price: "$25",
        type: "Expense"
    },
    {
        id: "2",
        name: "AirBnB Royalty",
        image: icons.airbnb,
        date: "Dec 24, 2024",
        time: "09:37:24 PM",
        price: "$1225",
        type: "Income"
    },
    {
        id: "3",
        name: "Darron Kulikwiski",
        image: images.user4,
        date: "Dec 24, 2024",
        time: "08:11:02 PM",
        price: "$250",
        type: "Income"
    },
    {
        id: "4",
        name: "Netflix Subscription",
        image: icons.netflix,
        date: "Dec 23, 2024",
        time: "16:35:47 PM",
        price: "$32",
        type: "Expense"
    },
    {
        id: "5",
        name: "Hannah Burress",
        image: images.user5,
        date: "Dec 23, 2024",
        time: "11:43:56 PM",
        price: "$25",
        type: "Income"
    },
    {
        id: "6",
        name: "Aillen Fullbright",
        image: images.user7,
        date: "Dec 22, 2024",
        time: "15:43:29 PM",
        price: "$80",
        type: "Expense"
    },
    {
        id: "7",
        name: "Ali Sankos",
        image: images.user8,
        date: "Dec 22, 2024",
        time: "14:26:34 PM",
        price: "$2500",
        type: "Income"
    },
    {
        id: "8",
        name: "Juliana Scott",
        image: images.user9,
        date: "Dec 21, 2024",
        time: "10:20:14 PM",
        price: "$400",
        type: "Income"
    },
    {
        id: "9",
        name: "Liliana Jacqueline",
        image: images.user10,
        date: "Dec 21, 2024",
        time: "17:09:22 PM",
        price: "$324",
        type: "Expense"
    },
    {
        id: "10",
        name: "Jean Lucas",
        image: images.user9,
        date: "Dec 21, 2024",
        time: "17:09:22 PM",
        price: "$1000",
        type: "Income"
    }
];