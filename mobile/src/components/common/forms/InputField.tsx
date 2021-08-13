import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../../../utils/colors';
import { FieldBaseProps } from './common-props';
import FieldLabel from './FieldLabel';


const InputField: React.FC<FieldBaseProps> = ({ setFunction, field, currentValue }) => {

    const [value, setValue] = useState<string>('');

    useEffect(() => {
    
        setValue(currentValue && typeof currentValue === 'string' ? currentValue : '');
    },[currentValue]);


    const changeTextHandler = (text: string) => {
        setValue(text);
        setFunction(field.name, text.trimEnd());
    };

    
    return (
        <View style={ styles.container }>
            <FieldLabel field={ field } />
            <TextInput
                multiline={ false }
                value={ value }
                onChangeText={ changeTextHandler }
                style={ styles.textInputStyle }
                autoCompleteType="off"
                testID="input" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 5,
        padding: 5,
        width: '100%'
    },
    textInputStyle: {
        marginTop: 3,
        borderColor: colors.lightgray,
        borderWidth: 1,
    }
});

export default InputField;