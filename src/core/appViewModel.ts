import { ipcRenderer } from 'electron';
import { BluetoothDeviceInfo } from '../spork/src/interfaces/deviceController';

import { FxChangeMessage, Preset } from '../spork/src/interfaces/preset';
import { FxMappingSparkToTone } from './fxMapping';
import { Login, SoundshedApi, Tone } from './soundshedApi';

export class AppViewModel {

    public storedPresets: Tone[] = [];
    public tones: Tone[] = [];

    private soundshedApi = new SoundshedApi();

    constructor() {

    }

    log(msg: string) {
        console.log(msg);
    }

    async performSignIn(login: Login): Promise<boolean> {

        try {
            let loginResult = await this.soundshedApi.login(login);
            return true;
        } catch (err) {
            return false;
        }
    }

    loadFavourites(): Tone[] {
        let favourites: Tone[] = [];
        let allPresets = localStorage.getItem("favourites");
        if (allPresets != null) {
            favourites = JSON.parse(allPresets);
        }

        this.storedPresets = favourites;


        return this.storedPresets;

    }

    async loadLatestTones(): Promise<Tone[]> {
        try {
            const result = await this.soundshedApi.getTones();

            this.tones = result.result ?? [];

            return this.tones;
        } catch (err) {
            return [];
        }
    }

    async storeFavourite(preset: any, includeUpload: boolean = false): Promise<boolean> {

        if (preset != null) {

            let convertedTone = new FxMappingSparkToTone().mapFrom(preset);

            let favourites: Tone[] = [];
            let allPresets = localStorage.getItem("favourites");
            if (allPresets != null) {
                favourites = JSON.parse(allPresets);
            }

            if (favourites.find(t => t.name == convertedTone.name)) {
                alert("You already have a preset stored with the same name.")
                return false;
            }

            favourites.push(convertedTone);
            localStorage.setItem("favourites", JSON.stringify(favourites));


            this.storedPresets = favourites;

            //attempt upload
            if (includeUpload) {
                try {

                    this.soundshedApi.updateTone(convertedTone).then(() => {
                        //tone updated
                        this.log("Tone uploaded to Soundshed");
                        alert("Tone uploaded to Soundshed");
                    });


                } catch (err) {
                    this.log("Error: " + err);
                    alert("Sorry, this tone could not be uploaded to Soundshed at this time.");
                }
            }
            return true;
        }
        else {
            return false;
        }

    }
}

export default AppViewModel;