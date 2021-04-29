import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from 'mobile/App';
import { Button, Center, FormControl, Input, Row, Stack, View } from 'native-base';
import React, { SetStateAction, useState } from 'react';
import { update } from 'tsfun';
import { Settings } from '../model/settings';


interface SettingsScreenProps {
    navigation: StackNavigationProp<AppStackParamList, 'SplashScreen'>;
    settings: Settings;
    setSettings: React.Dispatch<SetStateAction<Settings>>;
}


const SettingsScreen: React.FC<SettingsScreenProps> = ({
    navigation,
    settings,
    setSettings
}) => {

    const [username, setUsername] = useState(settings.username);

    const saveSettings = () => {

        const newSettings = update('username', username, settings);
        setSettings(newSettings);
        navigation.goBack();
    };

    return (
        <View flex={ 1 } safeArea>
            <Center flex={ 1 }>
                <FormControl isRequired isInvalid={ username === '' }>
                    <Stack mx={ 8 }>
                        <FormControl.Label>Editor name</FormControl.Label>
                        <Input p={ 2 } mt={ 2 } value={ username } onChangeText={ setUsername } />
                        <FormControl.HelperText mt={ 1 }>
                            The editor name is saved in the editing history in order
                            to allow dataset changes to be attributable to a person.
                        </FormControl.HelperText>
                        { username === '' && <FormControl.ErrorMessage mt={ 1 }>
                            Editor name must not be empty.
                        </FormControl.ErrorMessage> }
                    </Stack>
                </FormControl>
                <Row mt={ 5 } space={ 2 }>
                    <Button colorScheme="green" size="md" onPress={ () => saveSettings() }>
                        Save
                    </Button>
                    <Button colorScheme="red" size="md" _text={ { color: 'white', fontWeight: 'semibold' } }
                        onPress={ () => navigation.goBack() }
                    >
                        Cancel
                    </Button>
                </Row>
            </Center>
        </View>
    );
};

export default SettingsScreen;