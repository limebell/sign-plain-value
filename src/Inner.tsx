import { gql, useMutation } from "@apollo/client";
import { useState } from "react";
import { ChronoWallet } from "@planetarium/chrono-sdk";
import { Address } from "@planetarium/account";

const STAGE_TRANSACTION = gql`
	mutation StageTransaction($tx: String!) {
		stageTransaction(payload: $tx)
	}
`;

export function Inner({ accounts, chronoWallet }: {
	 accounts: Address[],
	 chronoWallet: ChronoWallet }) {
	console.log('Component rendered');

	const [inputValue, setInputValue] = useState<string>("");
	const [txId, setTxId] = useState<string | null>(null);
	const [progress, setProgress] = useState<"None" | "Staging" | "Done">("None");
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const [stage] = useMutation(STAGE_TRANSACTION);

	return (
		<div className="flex flex-col bg-gray-900 justify-center items-center min-w-screen min-h-screen">
			<textarea
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				className="p-4 mb-4 border border-white bg-gray-800 text-white w-96 h-48 resize-none"
				placeholder="Enter action's plainValue..."
			></textarea>
			<select
				className="p-2 mb-4 border border-white bg-gray-800 text-white w-96"
				value={selectedIndex}
				onChange={(e) => setSelectedIndex(Number(e.target.value))}
			>
				{accounts.map((account, index) => (
					<option key={account.toString()} value={index}>
						{account.toString()}
					</option>
				))}
			</select>
			<div className="text-white mb-4">
				Signing with address: {accounts[selectedIndex].toString()}
			</div>
			<button
				className="bg-white p-4 font-bold"
				disabled={progress === "Staging"}
				onClick={() => {
					if (chronoWallet === undefined) {
						return;
					}

					const signer = accounts[selectedIndex];
					chronoWallet
						.signWithPlainValue(signer, inputValue)
						.then((tx) => {
							console.log(tx);
							setProgress("Staging");
							return stage({
								variables: {
									tx: tx.toString("hex"),
								},
							}).then(({ data, errors }) => {
								setProgress("Done");
								setTxId(data?.stageTransaction || null);
								console.log(data, errors);
							});
						})
						.catch((e: unknown) => {
							console.error(e);
							setProgress("None");
						});
				}}
			>
				{progress === "Staging" ? "Staging..." : progress === "Done" ? "Done" : "Submit"}
			</button>
			{txId && (
				<p className="text-white mt-4">
					Last Transaction: ${txId}
				</p>
			)}
		</div>
	);
} 