import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { useTheme } from "@react-navigation/native";
import api from "../config/axios";

const AddDeal = () => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [terms, setTerms] = useState("");
    const [start_date, setStartDate] = useState("");
    const [end_date, setEndDate] = useState("");

    const [view, setView] = useState("Basic Information");



    const handleTitleChange = (text: string) => {
        setTitle(text);
    }

    const handleDescriptionChange = (text: string) => {
        setDescription(text);
    }

    const handleBudgetChange = (text: string) => {
        setBudget(text);
    }

    const handleTermsChange = (text: string) => {
        setTerms(text);
    }

    const handleContinueBasicInformation = () => {
        setView("Terms");
    }

    const handleContinueTerms = () => {
        setView("Start & End Date");
    }

    const handleStartDateChange = (text: string) => {
        setStartDate(text);
    }

    const handleEndDateChange = (text: string) => {
        setEndDate(text);
    }

    const handlePostDeal = async () => {
        try {
            const response = await api.post("/addDeal", { title, description, budget, terms, start_date, end_date });
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <View>
            {view === "Basic Information" && (
                <>
                    <Text>{view}</Text>
                    <Text>Title</Text>
                    <TextInput placeholder="title..." onChangeText={handleTitleChange} />
                    <Text>Description</Text>
                    <TextInput placeholder="description..." onChangeText={handleDescriptionChange} />
                    <Text>Budget</Text>
                    <TextInput placeholder="budget..." onChangeText={handleBudgetChange} />
                    <Button title="Continue" onPress={handleContinueBasicInformation} />
                </>
            )}
            {view === "Terms" && (
                <>
                    <Text>{view}</Text>
                    <Text>Terms</Text>
                    <Text>Term</Text>
                    <TextInput placeholder="terms..." onChangeText={handleTermsChange} />
                    <Button title="Continue" onPress={handleContinueTerms} />
                </>
            )}
            {view === "Start & End Date" && (
                <>
                    <Text>{view}</Text>
                    <Text>Start Date</Text>
                    <TextInput placeholder="start date..." onChangeText={handleStartDateChange} />
                    <Text>End Date</Text>
                    <TextInput placeholder="end date..." onChangeText={handleEndDateChange} />
                    <Button title="Post Deal" onPress={handlePostDeal} />
                </>
            )}
        </View>
    )
}

export default AddDeal;
