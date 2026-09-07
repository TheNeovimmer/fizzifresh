import {
  SliceSimulator,
  SliceSimulatorParams,
  getSlices,
} from "@slicemachine/adapter-next/simulator";
import { SliceZone } from "@prismicio/react";
import { redirect } from "next/navigation";

import { components } from "@/slices";

export default async function SliceSimulatorPage(props: any) {
  const searchParams = await props.searchParams;
  if (
    process.env.SLICE_SIMULATOR_SECRET &&
    searchParams?.secret !== process.env.SLICE_SIMULATOR_SECRET
  ) {
    redirect("/");
  }

  const slices = getSlices(searchParams?.state);

  return (
    <SliceSimulator background="" zIndex={10}>
      <div className="max-h-[900px]">
        <SliceZone slices={slices} components={components} />
      </div>
    </SliceSimulator>
  );
}
