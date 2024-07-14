import {Slot} from "expo-router"
import { SQLiteProvider } from "expo-sqlite"


const _layout = () => {
    return(
        <SQLiteProvider databaseName="emerBase.db">
            <Slot/>
        </SQLiteProvider>
    );
};

export default _layout;