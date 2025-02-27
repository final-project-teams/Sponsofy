import React, { useState } from "react";
import { View, Text, TextInput, Button, Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import api from "../config/axios";

const AddDeal = () => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState(0);
    const [terms, setTerms] = useState("");
    const [start_date, setStartDate] = useState("");
    const [end_date, setEndDate] = useState("");

    const [view, setView] = useState("Basic Information");

    const [errors, setErrors] = useState({
        title: '',
        description: '',
        budget: '',
        terms: '',
        start_date: '',
        end_date: ''
    });

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const handleTitleChange = (text: string) => {
        setTitle(text);
    }

    const handleDescriptionChange = (text: string) => {
        setDescription(text);
    }

    const handleBudgetChange = (text: number) => {
        setBudget(text);
    }

    const handleTermsChange = (text: string) => {
        setTerms(text);
    }

    const handleContinueBasicInformation = () => {
        if (title && description && budget > 0) {
            setView("Terms");
        }
    }

    const handleContinueTerms = () => {
        if (terms) {
            setView("Start & End Date");
        }
    }

    const handleStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate.toISOString().split('T')[0]); // Format: YYYY-MM-DD
        }
    };

    const handleEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate.toISOString().split('T')[0]); // Format: YYYY-MM-DD
        }
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };

        if (!title.trim()) {
            newErrors.title = 'Title is required';
            isValid = false;
        }

        if (!description.trim()) {
            newErrors.description = 'Description is required';
            isValid = false;
        }

        if (!budget || budget <= 0) {
            newErrors.budget = 'Valid budget is required';
            isValid = false;
        }

        if (!terms.trim()) {
            newErrors.terms = 'Terms are required';
            isValid = false;
        }

        if (!start_date.trim()) {
            newErrors.start_date = 'Start date is required';
            isValid = false;
        }

        if (!end_date.trim()) {
            newErrors.end_date = 'End date is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handlePostDeal = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            const response = await api.post("/addDeal", {
                title,
                description,
                budget,
                terms,
                start_date,
                end_date
            });
            console.log(response.data);
            // Add success handling here (e.g., navigation or success message)
        } catch (error) {
            console.error('Error posting deal:', error);
            // Add error handling here (e.g., error message to user)
        }
    }

    return (
        <View>
            {view === "Basic Information" && (
                <>
                    <Text>{view}</Text>
                    <Text>Title</Text>
                    <TextInput
                        placeholder="title..."
                        onChangeText={handleTitleChange}
                        value={title}
                    />
                    {errors.title ? <Text style={{ color: 'red' }}>{errors.title}</Text> : null}

                    <Text>Description</Text>
                    <TextInput
                        placeholder="description..."
                        onChangeText={handleDescriptionChange}
                        value={description}
                    />
                    {errors.description ? <Text style={{ color: 'red' }}>{errors.description}</Text> : null}

                    <Text>Budget</Text>
                    <TextInput
                        placeholder="budget..."
                        onChangeText={(text) => handleBudgetChange(Number(text))}
                        keyboardType="numeric"
                        value={budget.toString()}
                    />
                    {errors.budget ? <Text style={{ color: 'red' }}>{errors.budget}</Text> : null}

                    <Button
                        title="Continue"
                        onPress={handleContinueBasicInformation}
                    />
                </>
            )}
            {view === "Terms" && (
                <>
                    <Text>{view}</Text>
                    <Text>Terms</Text>
                    <TextInput
                        placeholder="terms..."
                        onChangeText={handleTermsChange}
                        value={terms}
                    />
                    {errors.terms ? <Text style={{ color: 'red' }}>{errors.terms}</Text> : null}

                    <Button
                        title="Continue"
                        onPress={handleContinueTerms}
                    />
                </>
            )}
            {view === "Start & End Date" && (
                <>
                    <Text>{view}</Text>

                    <Text>Start Date</Text>
                    <Button
                        onPress={() => setShowStartDatePicker(true)}
                        title={start_date || "Select Start Date"}
                    />
                    {showStartDatePicker && (
                        <DateTimePicker
                            value={start_date ? new Date(start_date) : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleStartDateChange}
                        />
                    )}
                    {errors.start_date ? <Text style={{ color: 'red' }}>{errors.start_date}</Text> : null}

                    <Text>End Date</Text>
                    <Button
                        onPress={() => setShowEndDatePicker(true)}
                        title={end_date || "Select End Date"}
                    />
                    {showEndDatePicker && (
                        <DateTimePicker
                            value={end_date ? new Date(end_date) : new Date()}
                            mode="date"
                            display="default"
                            onChange={handleEndDateChange}
                            minimumDate={start_date ? new Date(start_date) : undefined}
                        />
                    )}
                    {errors.end_date ? <Text style={{ color: 'red' }}>{errors.end_date}</Text> : null}

                    <Button
                        title="Post Deal"
                        onPress={handlePostDeal}
                    />
                </>
            )}
        </View>
    )
}

export default AddDeal;
