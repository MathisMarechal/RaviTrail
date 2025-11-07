import { type FormEvent} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyContext } from "../context/Context";
import { supabase } from "../supabase-client";



function LoginPage () {
    const navigate = useNavigate();
    const location = useLocation();

    const {isSignUp,setIsSignUp, email, setEmail, password, setPassword} = useMyContext();

    const handleSubmitLog = async (e:FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isSignUp) {
            const {error: signUpError} = await supabase.auth.signUp({email, password});
            
            if (signUpError) {
                console.error("Error signing Up: ", signUpError.message);
                return
            }
        } else {
            const {error: signInError} = await supabase.auth.signInWithPassword({email,password});

            if (signInError) {
                console.error("Error signing In: ", signInError.message);
                return
            }
        }
    }


    return (
        <>
        <div className="containerHomePage">
            <video autoPlay loop muted playsInline className="background-clip">
                    <source src="src/image/TrailBG1.mp4" type="video/mp4"/>
            </video>
            <header style={{display:"flex", flexDirection:"column",justifyContent:"normal",width:"100%"}}>
                <div className="d-flex justify-content-evenly" style={{paddingBottom:"30px",paddingTop:"30px", backgroundColor:"#0D6EFD"}}>
                    <div style={{ cursor: "pointer", textDecoration: location.pathname=== "/" ? "underline" : "none" , color:"white ",fontWeight:"bold",textUnderlineOffset:"8px"}} onClick={()=>navigate("/")}>Home</div>
                    <div style={{color:"white ",fontWeight:"bold"}}>RaviTrail</div>
                    <div style={{cursor:"pointer",textDecoration: location.pathname=== "/Login" ? "underline" : "none" ,color:"white ",fontWeight:"bold",textUnderlineOffset:"8px"}} onClick={()=>navigate("/")}>Login</div>
                </div>
            </header>
            <div className="overlay">
                <p style={{textAlign:"center",fontWeight: "bold", fontSize:"1.5rem"}}>Planifie tes ravitaillements. <br /> Garde l'énergie pour franchir la ligne d'arrivée. </p> 
                 <ul style={{textAlign:"left", maxWidth:"600px"}}>
                    <li>📍 Importe ta trace GPX et visualise tout ton parcours.</li>
                    <li>🏁 Ajoute facilement tes points de ravitaillement sur la carte.</li>
                    <li>🍫 Crée tes propres items alimentaires avec leurs valeurs énergétiques (calories, glucides, etc.).</li>
                    <li>⚖️ Ajuste les quantités selon tes besoins et la durée de l'effort.</li>
                    <li>💰 Gère ton budget pour garder le contrôle sur les coûts.</li>
                 </ul>
            </div>
            <h1 style={{color:"#0D6EFD", textAlign:"center", marginBottom:"70px", marginTop:"50px"}}>Commencer maintenant</h1>
            <div className="container mt-5" style={{backgroundColor: "rgba(255,255,255,0.9)", borderRadius:"10px", padding:"20px", marginBottom:"50px"}}>
                <h2 style={{color:"#0D6EFD", textAlign:"center", marginBottom:"70px", marginTop:"50px"}}>{isSignUp ? "SignUp" : "SignIn"}</h2>
                <form onSubmit={handleSubmitLog}>
                    <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={email} onChange={(e)=>setEmail(e.target.value)}></input>
                        <div id="emailHelp" className="form-text">Nous ne partagerons jamais votre adresse e-mail avec qui que ce soit d'autre.</div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-control" id="InputPassword" value={password} onChange={(e)=> setPassword(e.target.value)}></input>
                    </div>
                    <button type="submit" className="btn btn-primary">Entrer</button>
                    <button type="button" className="btn btn-secondary" style={{marginLeft:"2em"}} onClick={()=>setIsSignUp(!isSignUp)}>{isSignUp ? "SignIn" : "SignUp"}</button>
                </form>
            </div>
            <div className="bottomBanner">
                <p style={{textAlign:"center",color:"white",marginBottom: "0px"}}>@raviTrail</p>
            </div>
        </div>
        </>
    )
}
export default LoginPage;