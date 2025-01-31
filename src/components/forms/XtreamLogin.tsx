import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/router";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api/services/api.service";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  totp: z.string().regex(/^\d{6}$/, "TOTP must be 6 digits"),
  pin: z.string().regex(/^\d{6}$/, "PIN must be 6 digits"),
});

export default function TwoFactorAuthForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totp: "",
      pin: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const response = await apiService.auth.xtreamLogin(values);

      toast({
        title: "2FA Verification Successful",
        description: "Authentication completed successfully!",
      });

      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description:
          error.response?.data?.message || "Invalid verification codes",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-md mx-auto"
      >
        {/* TOTP Field */}
        <FormField
          name="totp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TOTP Code</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                  maxLength={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PIN Field */}
        <FormField
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Security PIN</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="6-digit PIN"
                  autoComplete="current-pin"
                  maxLength={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Identity
        </Button>
      </form>
    </Form>
  );
}

