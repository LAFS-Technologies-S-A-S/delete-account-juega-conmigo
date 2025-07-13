import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { useState } from "react";
import "./App.css";

function App() {
  const [motivo, setMotivo] = useState("");
  const [otros, setOtros] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleDeleteAccount = async () => {
    if (!email || !password) {
      alert("Por favor ingresa tu correo y contraseña para confirmar.");
      return;
    }
    try {
      // Autenticar usuario
      const { data: session, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      if (signInError || !session?.user) {
        throw new Error("Credenciales inválidas");
      }

      const userId = session.user.id;

      // Guardar feedback antes de eliminar
      const { error: feedbackError } = await supabase
        .from("feedback_salida")
        .insert([
          {
            user_id: userId,
            correo: email,
            motivo,
            comentario: otros,
          },
        ]);

      if (feedbackError) {
        throw feedbackError;
      }

      // Borrar datos relacionados en eventos_usuarios
      const { error: deleteEventosUsuariosError } = await supabase
        .from("eventos_usuarios")
        .delete()
        .eq("user_id", userId);

      if (deleteEventosUsuariosError) {
        console.warn(
          "Error borrando eventos_usuarios:",
          deleteEventosUsuariosError.message
        );
      }

      // Borrar perfil
      const { error: deleteProfileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (deleteProfileError) {
        console.warn("Error borrando profile:", deleteProfileError.message);
      }

      // Borrar usuario de auth
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
        userId
      );

      if (deleteUserError) {
        throw deleteUserError;
      }

      alert("Tu cuenta y todos tus datos han sido eliminados exitosamente.");
    } catch (error) {
      console.error(error);
      alert(
        "Error al eliminar la cuenta. Verifica tus credenciales o contacta soporte."
      );
    }
  };

  return (
    <div className="container">
      <h1>Juega Conmigo</h1>
      <p>
        Lamentamos que te vayas... Tu cuenta será borrada y los eventos
        deportivos en los que participaste también, toda tu información, avatar,
        correo, contraseña y datos para que te sientas tranquilo.
      </p>
      <h2>¿Podrías decirnos por qué te vas?</h2>
      <div>
        <label>
          <input
            type="radio"
            name="motivo"
            value="No me gusta la aplicación"
            onChange={(e) => setMotivo(e.target.value)}
          />
          No me gusta la aplicación
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="motivo"
            value="Tiene errores la aplicación"
            onChange={(e) => setMotivo(e.target.value)}
          />
          Tiene errores la aplicación
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="motivo"
            value="Difícil de usar"
            onChange={(e) => setMotivo(e.target.value)}
          />
          Difícil de usar
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="motivo"
            value="Hay otra mejor"
            onChange={(e) => setMotivo(e.target.value)}
          />
          Hay otra mejor
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="motivo"
            value="Otras"
            onChange={(e) => setMotivo(e.target.value)}
          />
          Otras...
        </label>
        <br />
        <textarea
          placeholder="Escribe aquí (máx. 500 palabras)"
          maxLength={3000}
          rows={5}
          value={otros}
          onChange={(e) => setOtros(e.target.value)}
        />
      </div>
      <h2>Confirma tu cuenta</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleDeleteAccount}>Eliminar cuenta</button>
    </div>
  );
}

export default App;
