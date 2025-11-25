import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import GoogleOauthButton from "@/components/auth/google-oauth-button";
import { useMutation } from "@tanstack/react-query";
import { registerMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn,
  });

  const formSchema = z.object({
    name: z.string().trim().min(1, {
      message: "El nombre es requerido",
    }),
    email: z.string().trim().email("Dirección de correo inválida").min(1, {
      message: "El correo es requerido",
    }),
    password: z.string().trim().min(1, {
      message: "La contraseña es requerida",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;
    mutate(values, {
      onSuccess: () => {
        navigate("/");
        toast({
          title: "Cuenta creada",
          description: "Tu cuenta ha sido creada exitosamente.",
          variant: "success",
        });
      },
      onError: (error: any) => {
        const serverMessage = error.response?.data?.message;
        let displayMessage = serverMessage || error.message || "Ocurrió un error al registrarse";
        if (displayMessage === "Email already exists") {
          displayMessage = "Este correo electrónico ya está registrado.";
        }
        toast({
          title: "Error",
          description: displayMessage,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
          Team Sync.
        </Link>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Crear una cuenta</CardTitle>
              <CardDescription>
                Regístrate con tu Email o cuenta de Google
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-6">
                    <div className="flex flex-col gap-4">
                      <GoogleOauthButton label="Registrarse" />
                    </div>
                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                      <span className="relative z-10 bg-background px-2 text-muted-foreground">
                        O continuar con
                      </span>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">
                                Nombre
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nombre"
                                  className="!h-[48px]"
                                  {...field}
                                  autoComplete="name"
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">
                                Correo electrónico
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="usuario@example.com"
                                  className="!h-[48px]"
                                  {...field}
                                  autoComplete="email"
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid gap-2">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm">
                                Contraseña
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  className="!h-[48px]"
                                  {...field}
                                  autoComplete="new-password"
                                />
                              </FormControl>

                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full"
                      >
                        {isPending && <Loader className="animate-spin" />}
                        Registrarse
                      </Button>
                    </div>
                    <div className="text-center text-sm">
                      ¿Ya tienes una cuenta?{" "}
                      <Link to="/" className="underline underline-offset-4">
                        Iniciar sesión
                      </Link>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
            Al hacer clic en continuar, aceptas nuestros{" "}
            <a href="#">Términos de servicio</a> y <a href="#">Política de privacidad</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;