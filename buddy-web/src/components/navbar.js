import Link from "next/link";
import { useUser } from "@supabase/auth-helpers-react";

export default function Navbar(){

    const user = useUser();

    return (<nav className="shadow px-4 py-2 flex flex-row justify-between items-center">
    <div className="text-xl font-bold">Buddy</div>
    <div>
        {user ? (<Link href="/logout">Log Out</Link>): (<Link href="/login">Log In</Link>)}
    </div>
  </nav>);
}