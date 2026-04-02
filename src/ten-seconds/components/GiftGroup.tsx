import { cn } from "@/utils/cn";

interface GiftGroupProps {
  /** Ảnh quà tặng */
  imageSrc: string;
  imageClassName?: string;
  /** Nhãn chính hiển thị trong dải có gradient/border */
  label: string;
  labelClassName?: string;
  /** Mô tả nhỏ bên dưới */
  description: string;
  descriptionClassName?: string;
  /** Override className của wrapper ngoài cùng */
  className?: string;
}

export const GiftGroup = ({
  imageSrc,
  imageClassName,
  label,
  labelClassName,
  description,
  descriptionClassName,
  className,
}: GiftGroupProps) => {
  return (
    <div
      className={cn("flex flex-col items-center gap-4.5 w-[390px]", className)}
    >
      <img
        src={imageSrc}
        alt=""
        className={cn("object-contain", imageClassName)}
      />
      <div
        className="border-y-[1.05px] h-[min(63px,5.83vh)] w-full border-x-0 border-solid backdrop-blur-[2.80246901512146px] flex items-center justify-center"
        style={{
          background:
            "linear-gradient(270deg, rgba(5, 93, 154, 0) 0%, rgba(5, 93, 154, 0.7) 49.81%, rgba(5, 93, 154, 0) 100%)",
          borderImage:
            "linear-gradient(270deg, rgba(53, 163, 239, 0) 0%, #35A3EF 50.41%, rgba(53, 163, 239, 0) 100%) 1",
        }}
      >
        <span
          className={cn(
            "text-white text-[min(1.875rem,1.5625vw)] font-medium font-main leading-none",
            labelClassName,
          )}
        >
          {label}
        </span>
      </div>
      <span
        className={cn(
          "text-white text-[min(1.625rem,1.354vw)] font-main text-center leading-none",
          descriptionClassName,
        )}
      >
        {description}
      </span>
    </div>
  );
};
