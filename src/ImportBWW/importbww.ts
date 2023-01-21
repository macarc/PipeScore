import Auth from "firebase-auth-lite";
import { Database } from "firebase-firestore-lite";
import { onUserChange } from "../auth-helper";
import { parse } from "./Parser";

// This can be safely public
const apiToken = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';

const auth = new Auth({ apiKey: apiToken });

const db = new Database({ projectId: 'pipe-score', auth });

let user: string | null = null;
onUserChange(auth, newUser => {
    if (newUser) {
        user = newUser.localId;
    } else {
        user = null;
    }
})

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector("form")?.addEventListener('submit', (e) => {
        e.preventDefault();
        const file = document.querySelector('input[type="file"]');
        if (file instanceof HTMLInputElement && file.files && file.files.length > 0) {
            if (file.files.length > 1) {
                // FIXME
                alert("You can't import more than one file at once");
                throw new Error();
            }
            const bwwFile = file.files[0];
            const reader = new FileReader();
            reader.readAsText(bwwFile, "UTF-8");
            reader.addEventListener('error', () => {
                alert("Could not read file");
            })
            reader.addEventListener('load', async (e) => {
                const data = e.target?.result;
                if (data) {
                    const text = data.toString();
                    try {
                        const [score, warnings] = parse(text);
                        if (warnings.length > 0) {
                            alert("Imported with the following warnings:\n" + warnings.join('\n'));
                        }

                        if (user !== null) {
                            const collection = await db.ref(`scores/${user}/scores`);
                            const newScore = await collection.add(score);
                            if (newScore) {
                                window.location.assign(`/pipescore/${user}/${newScore.id}`);
                            }
                        } else {
                            alert("You must be logged in to import BWW.");
                        }

                    } catch (err) {
                        alert("An error occurred while trying to import:\n" + (err as Error).message)
                        throw err;
                    }

                } else {
                    alert("Nothing could be read from the file (is it empty? does it exist?)");
                }
            })
        } else {
            alert("You must add a file to import.");
        }
    })
});