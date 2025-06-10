/* eslint-disable react/display-name */
/* eslint-disable react/react-in-jsx-scope */
"use client";

import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

import searchBar from "./searchBar";
import { ModeToggle } from "../../app/mode-toggle";

export default function () {
  return (
    <>
      <div className="poppins p-6 flex justify-between items-center">
        <div className="flex items-center gap-16">
          <searchBar />
        </div>
        <div className="flex items-center gap-5">
          <ModeToggle />
          <Separator
            orientation="vertical"
            className="h-5 w-[-2px] bg-gray-500"
          />
          <Button className="rounded-3xl h-10 shadow-none">
            Add New Project
          </Button>
        </div>
      </div>
    </>
  );
}
