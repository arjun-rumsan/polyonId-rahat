import Image from "next/image";
import { identityCreation } from "./utils/createDid";

export default function Home() {
  const getDid = async () => {
    const did = await identityCreation();

    console.log(did);
  };

  getDid();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h2>Hello Eth India</h2>
    </div>
  );
}
