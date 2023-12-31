import mongoose from "mongoose";
import { IPCBuild } from "./pcBuild.interface";
import { PcBuild } from "./pcBuild.model";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";

const createPcBuild = async (
  pcBuildData: IPCBuild
): Promise<IPCBuild | null> => {
  // console.log(pcBuildData?.product)
  // console.log('pcBuild = ', pcBuildData?.userEmail)

  const existingProduct = await PcBuild.findOne({
    $and: [
      { userEmail: pcBuildData?.userEmail },
      { product: pcBuildData?.product },
    ],
  });

  if (existingProduct) {
    // If a matching PC build already exists, throw an error
    throw new ApiError(httpStatus.BAD_REQUEST, "Already Added this product");
  }

  let pcBuildAllData = null;

  // Start the transaction
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const pcBuild = await PcBuild.create([pcBuildData], { session });

    if (!pcBuild.length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Failed to create pcBuildData"
      );
    }

    pcBuildAllData = pcBuild[0];

    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }

  return pcBuildAllData;
};

export const PcBuildService = {
  createPcBuild,
};
