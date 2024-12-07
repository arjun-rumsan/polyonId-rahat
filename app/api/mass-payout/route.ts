import { Coinbase, Wallet, WalletData, } from "@coinbase/coinbase-sdk";
import { createArrayCsvWriter } from "csv-writer";
import os from "os";
import fs from "fs/promises";
import path from "path";
import { parse } from "csv-parse";
import { parseEther } from "ethers";


export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
    // Specifies the maximum allowed duration for this function to execute (in seconds)
    maxDuration: 15,
}

interface Asset {
    symbol: string;
    address: string;
    decimals: number;
}

interface PayoutRecipient {
    address: string;
    amount: number;
}




// Create receiving Wallets.
async function createReceivingWallets() {
    // Create 5 receiving Wallets and only store Wallet Addresses.
    const addresses = [];

    for (let i = 1; i <= 5; i++) {
        let receivingWallet = await Wallet.create();
        console.log(`Receiving Wallet${i} successfully created: `, receivingWallet.toString());

        let receivingAddress = await receivingWallet.getDefaultAddress();
        console.log(`Default address for Wallet${i}: `, receivingAddress.getId());
        addresses.push([receivingAddress.getId()]); // Storing Address as an array.
    }

    return addresses;
}

// Write to CSV file with receiving Wallet Addresses.
async function writeReceivingAddressesToCsv(addresses: any[]) {
    // Define CSV file.
    const csvWriter = createArrayCsvWriter({
        path: "wallet-array.csv",
    });

    // Write Wallet Addresses to CSV file.
    await csvWriter.writeRecords(addresses);
    console.log("The CSV file was written successfully without headers.");
}


// Function to create a wallet and save its data (seed and ID)
async function createWallet() {
    // Create the wallet (with a specific network if needed)
    let wallet = await Wallet.create();

    // Export wallet data (seed and ID)
    const walletData = wallet.export();

    // Securely store the wallet seed and ID (for re-instantiating the wallet later)
    const filePath = path.resolve(__dirname, 'wallet-data.json');

    // Save wallet data to a file (you can encrypt this if needed, shown without encryption for simplicity)
    await fs.writeFile(filePath, JSON.stringify(walletData, null, 2), 'utf-8');
    console.log(`Wallet created and data saved to ${filePath}`);

    return wallet;
}

// Function to fetch the wallet and hydrate it using the saved seed data
async function fetchWallet() {
    const filePath = path.resolve(__dirname, 'wallet-data.json');

    try {
        // Read the saved wallet data
        const walletData = await fs.readFile(filePath, 'utf-8');
        const walletInfo = JSON.parse(walletData);

        // Import the wallet using the saved seed and ID
        let wallet = await Wallet.import(walletInfo);

        // Hydrate the wallet (ensure it's ready to use)
        console.log(`Wallet ${wallet.getAddress(wallet.getId()!!)} successfully fetched and hydrated.`);

        return wallet;
    } catch (error) {
        console.error('Error fetching wallet:', error);
        throw error;
    }
}

// Function to save the wallet seed (development-only method)
async function saveWalletSeed(wallet: Wallet) {
    const filePath = path.resolve(__dirname, 'my_seed.json');

    // Securely save the seed (the encryption process is optional and can be set to `true` for encryption)
    await wallet.saveSeed(filePath, true); // Pass `true` to encrypt the seed with your CDP secret API key

    console.log(`Seed for wallet ${wallet.getId()} successfully saved to ${filePath}.`);
}

async function getOrCreateWallet() {
    const filePath = path.resolve(__dirname, 'wallet-data.json');

    try {
        // Try to read the wallet data from file
        const walletData = await fs.readFile(filePath, 'utf-8');
        const walletInfo = JSON.parse(walletData);

        // Import the wallet using the saved seed and ID
        let wallet = await Wallet.import(walletInfo);

        // Hydrate the wallet (ensure it's ready to use)
        console.log(`Wallet ${wallet.getId()} successfully fetched and hydrated.`);
        return wallet;

    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // If the file does not exist, create a new wallet
            console.log('Wallet file not found, creating a new wallet...');
            const newWallet = await createWallet();

            // Optionally, save the wallet seed for future use
            await saveWalletSeed(newWallet);
            return newWallet;
        } else {
            // If another error occurred, throw it
            console.error('Error reading wallet file:', error);
            throw error;
        }
    }
}




// Read from CSV file and send mass payout.
async function sendMassPayout(
    sendingWallet: Wallet,
    addressess: any[],
    assetId = Coinbase.assets.Eth,
    transferAmount: number = 0.0000001,
    recipients: PayoutRecipient[]
) {    // Define amount to send.

    try {
        console.log("balance of asset of eth", (await sendingWallet.getBalance(assetId)).toNumber())
        for await (const address of addressess) {
            try {
                const transfer = await sendingWallet.createTransfer({
                    // Send payment to each Address in CSV.
                    amount: transferAmount,
                    assetId: assetId,
                    destination: address.toString(),


                });

                await transfer.wait();

                console.log(`Transfer to ${address} successful`);
            } catch (error) {
                console.error(`Error transferring to ${address}: `, error);
            }

        }
    } catch (error) {
        console.error(`Error processing CSV file: `, error);
    }

    console.log("Finished processing CSV file");
}


async function createAndFundSendingWallet() {
    // Get or create the wallet
    const sendingWallet = await getOrCreateWallet();

    console.log("Sending funds direclty to the client........")

    try {
        await sendingWallet.faucet(Coinbase.assets.Eth)

    } catch (error) {
        console.log('Error sending funds', error);

    }

    // Get the default address of the wallet
    const sendingAddress = await sendingWallet.getDefaultAddress();
    console.log(`Default address for sendingWallet: ${sendingAddress.toString()}`);

    return sendingWallet;
}


export async function POST(
    request: Request,
    { params }: { params: any }
) {
    try {
        // Validate params
        // if (!params || !Object.keys(params).length) {
        //     return Response.json({
        //         data: "Payout cannot be completed no params",
        //     }, {
        //         status: 500
        //     });
        // }

        const addresses = [
            "0x15D7AA0B820027a82Bb228e1e9675C05B695C363",
            "0x12120bda45C87FbfDF3aADF1004e318BB3D4E531",
            "0x57fC5424225F00c1f5f1431dF6c7c6e1829A1660",
        ];

        if (!addresses.length) {
            return Response.json({
                data: "Payout cannot be completed",
            });
        }

        // Configure Coinbase
        Coinbase.configureFromJson({
            filePath: `${os.homedir()}/Downloads/cdp_api_key.json`,
        });

        // Process payout
        // const receivingAddresses = await createReceivingWallets();
        // await writeReceivingAddressesToCsv(receivingAddresses);
        const sendingWallet = await createAndFundSendingWallet();
        await sendMassPayout(sendingWallet, addresses, Coinbase.assets.Eth, undefined, []);

        return Response.json({
            data: "Payout completed successfully",
        });
    } catch (error) {
        console.error(`Error in sending mass payout: `, error);
        return Response.json({
            data: "An error occurred during the payout process",
        });
    }
}







function store(w: Wallet) {
    // Pick a file to which to save your wallet seed.
    let filePath = 'my_seed.json';

    // Set encrypt to true to encrypt the wallet seed with your CDP secret API key.
    w.saveSeed(filePath, true);

    console.log(`Seed for wallet ${w.getId()} successfully saved to ${filePath}.`);
}