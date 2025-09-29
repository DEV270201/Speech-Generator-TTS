"use client";
import { useEffect, useState } from "react";
import {
  GridColDef,
  DataGrid
} from "@mui/x-data-grid";
import type {} from "@mui/x-data-grid/themeAugmentation"; // Required for type safety
import AudioPlayer from "@/app/(components)/AudioPlayer";
import { useGet } from "../(components)/CustomHooks/useFetch";
import { toast } from "react-hot-toast";

let styleClassNames = "bg-darkaccent text-gray-200";

const columns: GridColDef[] = [
    {
    field: 'filename',
    headerName: 'Audio',
    width: 150,
    display: 'flex',
    renderCell: (params) => {
      // params.row contains the data for the current row
      return (
        <AudioPlayer
         filename={params.row.filename}
         duration={params.row.duration}
         id={params.row.id}
         hideDesign={true}
        />
      );
    },
  },
  { field: "text", headerName: "Prompt", flex: 1 },
  { field: "creation_date", headerName: "Date", flex: 1 },
  { field: "duration", headerName: "Duration",
    renderCell: (params) => {
          const minutes = Math.floor(params.row.duration / 60);
    const seconds = Math.floor(params.row.duration % 60)
      .toString()
      .padStart(2, "0");
      return(
            `${minutes}:${seconds}`
        )
    }

  },

];

const getStylingClass = () => {
  return styleClassNames;
};

const AudioHistory = () => {
  const [history, setHistory] = useState<any>([]);
  const {loading, get} = useGet({
    url:"http://127.0.0.1:8000/api/audio-history"
  })

  const fetchHistory = async () => {
     try{
      const response = await get();
      console.log("response from history: ", response);
      let data = response?.data;
      setHistory([...data]);
     }catch(err){
        console.log("Error while fetching records: ", err);
        toast.error("Sorry, something went wrong!");
        setHistory([]);
        return;
     }
  }

  useEffect(()=>{
     fetchHistory();
  },[]);

  return (
    <div className="flex flex-col flex-1">
      <p className="text-lg lg:text-2xl font-medium text-gray-200 mt-1">Audio History</p>
      <p className="text-sm sm:text-md font-normal italic text-gray-400 mb-1">All of your audios at a single place!</p>
      <div className="flex justify-center items-center w-full my-3">
      {loading ? (
          <p className="text-sm sm:text-md font-normal text-gray-400 my-1" >Stay there while I fetch the audios...</p>
        ) : (
            history.length === 0 ?
            <p className="text-sm sm:text-md font-normal text-gray-400 my-1">Nothing to listen back!!</p>
            :
            <DataGrid
            rows={history}
            columns={columns}
            getRowId={(row) => row.filename}
            checkboxSelection={false}
            className="bg-darkaccent shadow rounded-lg border border-gray-200 mt-5 text-gray-200"
            getRowClassName={getStylingClass}
            sx={{
                // 🔹 Table border
                border: "1px solid #9e9e9e",
                
                // 🔹 Change cell borders
                "& .MuiDataGrid-cell": {
                    borderColor: "#9e9e9e",
                },
                
                ".MuiDataGrid-columnHeader": {
                    backgroundColor: "#1E1F25",
                    color: "white",
                    fontWeight: "bold",
                },
                
                // 🔹 Footer styling
                ".MuiDataGrid-footerContainer": {
                    backgroundColor: "#1E1F25",
                    color: "#fff",
                    borderTop: "1px solid #9e9e9e",
                },
                
                // 🔹 Row hover effect
                ".MuiDataGrid-row:hover": {
                    backgroundColor: "#DBEAFE", // light blue on hover
                    cursor: "pointer",
                    color: "black",
                },
                ".MuiToolbar-root": {
                    color: "#fff",
                },
                ".MuiDataGrid-filler": {
                    backgroundColor: "#1E1F25"
                }
            }}
            />
        )}
        </div>
    </div>
  );
};

export default AudioHistory;
